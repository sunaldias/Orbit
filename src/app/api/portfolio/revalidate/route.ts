import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { secureLog } from "@/lib/logger";
import { PORTFOLIO_CACHE_TAG } from "@/lib/portfolio-repository";
import { enforceRevalidateRateLimit } from "@/lib/rate-limit";
import {
  extractClientIp,
  hashIp,
  readBoundedJsonBody,
  safeCompareSecret,
} from "@/lib/security";

export const runtime = "nodejs";

const MAX_WEBHOOK_BYTES = 4 * 1024; // 4 KB hard cap

const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0",
};

const revalidatePayloadSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120)
    .optional(),
  record: z
    .object({
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(120)
        .optional(),
    })
    .optional(),
});

/**
 * On-demand ISR revalidation endpoint protected by rate limiting and timing-safe
 * secret comparison (`x-orbit-revalidate-secret`).
 */
export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const ipHash = hashIp(extractClientIp(request.headers), env.IP_HASH_SALT);

  // 1. Rate-limit webhook attempts to defend against secret brute-forcing
  const limit = await enforceRevalidateRateLimit(ipHash);
  if (!limit.allowed) {
    const retryAfter = Math.max(
      1,
      limit.resetUnixSec - Math.floor(Date.now() / 1000)
    );
    secureLog("warn", {
      event: "revalidate_rate_limited",
      route: "/api/portfolio/revalidate",
      statusCode: 429,
      ipHashPrefix: ipHash,
    });
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      {
        status: 429,
        headers: { ...NO_STORE_HEADERS, "Retry-After": String(retryAfter) },
      }
    );
  }

  // 2. Enforce configured secret
  const expectedSecret = env.PORTFOLIO_REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "Revalidation is not enabled." },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  // 3. Timing-safe secret verification
  const providedSecret = request.headers.get("x-orbit-revalidate-secret") || "";
  if (!safeCompareSecret(providedSecret, expectedSecret)) {
    secureLog("warn", {
      event: "revalidate_unauthorized",
      route: "/api/portfolio/revalidate",
      statusCode: 401,
      ipHashPrefix: ipHash,
    });
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  // 4. Hard-bounded JSON read + Zod validation
  const bounded = await readBoundedJsonBody(request, MAX_WEBHOOK_BYTES, {
    allowEmpty: true,
  });
  if (!bounded.ok) {
    return NextResponse.json(
      { ok: false, error: bounded.error },
      { status: bounded.status, headers: NO_STORE_HEADERS }
    );
  }

  const parsed = revalidatePayloadSchema.safeParse(bounded.data);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid revalidation payload." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const slug = parsed.data.slug || parsed.data.record?.slug || null;

  revalidateTag(PORTFOLIO_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/portfolio/${slug}`);
  }

  secureLog("info", {
    event: "portfolio_revalidated",
    route: "/api/portfolio/revalidate",
    statusCode: 200,
    ipHashPrefix: ipHash,
  });

  return NextResponse.json(
    {
      ok: true,
      revalidated: true,
      slug,
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}
