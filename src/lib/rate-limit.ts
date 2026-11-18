import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getServerEnv } from "@/lib/env";
import { secureLog } from "@/lib/logger";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetUnixSec: number;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  reason?: "idempotency" | "content";
}

// Local development / resilience fallback stores
const memoryBuckets = new Map<string, number[]>();
const memoryDedupStore = new Map<string, number>();

const DEDUP_WINDOW_SECONDS = 15 * 60; // 15 minutes

function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (memoryBuckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] ?? now;
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetUnixSec: Math.ceil((oldest + windowMs) / 1000),
    };
  }

  timestamps.push(now);
  memoryBuckets.set(key, timestamps);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - timestamps.length),
    resetUnixSec: Math.ceil((now + windowMs) / 1000),
  };
}

function claimMemoryKey(key: string, ttlSeconds: number): boolean {
  const now = Date.now();
  const expiresAt = memoryDedupStore.get(key);
  if (expiresAt && expiresAt > now) {
    return false;
  }
  memoryDedupStore.set(key, now + ttlSeconds * 1000);
  return true;
}

let sharedRedis: Redis | null = null;
let ipLimiter: Ratelimit | null = null;
let emailLimiter: Ratelimit | null = null;
let portfolioReadLimiter: Ratelimit | null = null;
let revalidateLimiter: Ratelimit | null = null;

function getUpstashRedis(): Redis | null {
  const env = getServerEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!sharedRedis) {
    sharedRedis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return sharedRedis;
}

function getUpstashLimiters() {
  const redis = getUpstashRedis();
  if (!redis) return null;

  if (!ipLimiter) {
    ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "orbit:rl:inquiry:ip",
      analytics: false,
    });
  }
  if (!emailLimiter) {
    emailLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "orbit:rl:inquiry:email",
      analytics: false,
    });
  }
  if (!portfolioReadLimiter) {
    portfolioReadLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "orbit:rl:portfolio:read",
      analytics: false,
    });
  }
  if (!revalidateLimiter) {
    revalidateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "15 m"),
      prefix: "orbit:rl:portfolio:revalidate",
      analytics: false,
    });
  }

  return {
    ip: ipLimiter,
    email: emailLimiter,
    portfolioRead: portfolioReadLimiter,
    revalidate: revalidateLimiter,
  };
}

export async function enforceInquiryIpRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters();
  if (!limiters) {
    return checkMemoryRateLimit(`ip:${ipHash}`, 5, 15 * 60 * 1000);
  }

  try {
    const res = await limiters.ip.limit(ipHash);
    return {
      allowed: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetUnixSec: Math.ceil(res.reset / 1000),
    };
  } catch {
    secureLog("warn", {
      event: "upstash_ratelimit_fallback",
      code: "REDIS_ERROR",
    });
    return checkMemoryRateLimit(`ip:${ipHash}`, 5, 15 * 60 * 1000);
  }
}

export async function enforceInquiryEmailRateLimit(
  normalizedEmail: string
): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters();
  if (!limiters) {
    return checkMemoryRateLimit(`email:${normalizedEmail}`, 5, 60 * 60 * 1000);
  }

  try {
    const res = await limiters.email.limit(normalizedEmail);
    return {
      allowed: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetUnixSec: Math.ceil(res.reset / 1000),
    };
  } catch {
    secureLog("warn", {
      event: "upstash_email_ratelimit_fallback",
      code: "REDIS_ERROR",
    });
    return checkMemoryRateLimit(`email:${normalizedEmail}`, 5, 60 * 60 * 1000);
  }
}

export async function enforcePortfolioReadRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters();
  if (!limiters) {
    return checkMemoryRateLimit(`portfolio-read:${ipHash}`, 60, 60 * 1000);
  }

  try {
    const res = await limiters.portfolioRead.limit(ipHash);
    return {
      allowed: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetUnixSec: Math.ceil(res.reset / 1000),
    };
  } catch {
    return checkMemoryRateLimit(`portfolio-read:${ipHash}`, 60, 60 * 1000);
  }
}

export async function enforceRevalidateRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters();
  if (!limiters) {
    return checkMemoryRateLimit(`revalidate:${ipHash}`, 20, 15 * 60 * 1000);
  }

  try {
    const res = await limiters.revalidate.limit(ipHash);
    return {
      allowed: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetUnixSec: Math.ceil(res.reset / 1000),
    };
  } catch {
    return checkMemoryRateLimit(`revalidate:${ipHash}`, 20, 15 * 60 * 1000);
  }
}

/**
 * Atomically claims deduplication locks in Upstash Redis (or in-memory fallback)
 * for both the request's idempotencyKey and content fingerprint for 15 minutes.
 */
export async function claimInquiryDeduplicationLock(
  idempotencyKey: string | undefined,
  fingerprint: string
): Promise<DeduplicationResult> {
  const redis = getUpstashRedis();
  const fpKey = `orbit:dedup:fp:${fingerprint}`;
  const idemKey = idempotencyKey ? `orbit:dedup:idem:${idempotencyKey}` : null;

  if (!redis) {
    if (idemKey && !claimMemoryKey(idemKey, DEDUP_WINDOW_SECONDS)) {
      return { isDuplicate: true, reason: "idempotency" };
    }
    if (!claimMemoryKey(fpKey, DEDUP_WINDOW_SECONDS)) {
      if (idemKey) memoryDedupStore.delete(idemKey);
      return { isDuplicate: true, reason: "content" };
    }
    return { isDuplicate: false };
  }

  try {
    if (idemKey) {
      const claimedIdem = await redis.set(idemKey, "1", {
        nx: true,
        ex: DEDUP_WINDOW_SECONDS,
      });
      if (!claimedIdem) {
        return { isDuplicate: true, reason: "idempotency" };
      }
    }

    const claimedFp = await redis.set(fpKey, "1", {
      nx: true,
      ex: DEDUP_WINDOW_SECONDS,
    });

    if (!claimedFp) {
      if (idemKey) {
        await redis.del(idemKey).catch(() => undefined);
      }
      return { isDuplicate: true, reason: "content" };
    }

    return { isDuplicate: false };
  } catch {
    secureLog("warn", {
      event: "upstash_dedup_fallback",
      code: "REDIS_ERROR",
    });
    if (idemKey && !claimMemoryKey(idemKey, DEDUP_WINDOW_SECONDS)) {
      return { isDuplicate: true, reason: "idempotency" };
    }
    if (!claimMemoryKey(fpKey, DEDUP_WINDOW_SECONDS)) {
      return { isDuplicate: true, reason: "content" };
    }
    return { isDuplicate: false };
  }
}

/**
 * Releases deduplication locks if a transient server/database error occurs
 * before the inquiry is persisted, allowing the customer to retry cleanly.
 */
export async function releaseInquiryDeduplicationLock(
  idempotencyKey: string | undefined,
  fingerprint: string
): Promise<void> {
  const redis = getUpstashRedis();
  const fpKey = `orbit:dedup:fp:${fingerprint}`;
  const idemKey = idempotencyKey ? `orbit:dedup:idem:${idempotencyKey}` : null;

  if (!redis) {
    memoryDedupStore.delete(fpKey);
    if (idemKey) memoryDedupStore.delete(idemKey);
    return;
  }

  const keys = idemKey ? [fpKey, idemKey] : [fpKey];
  await redis.del(...keys).catch(() => undefined);
}
