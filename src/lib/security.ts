import crypto from "crypto";

/**
 * Escapes HTML special characters to prevent XSS / HTML injection in emails or markup.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Safely serializes JSON-LD objects for embedding inside <script type="application/ld+json">.
 * Escapes `<`, `>`, `&`, U+2028, and U+2029 to prevent `</script>` breakout XSS attacks.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Constant-time secret string comparison using SHA-256 digests so timing side channels
 * cannot leak secret length or prefix matches.
 */
export function safeCompareSecret(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/**
 * Extracts client IP address safely from Vercel / reverse-proxy headers.
 */
export function extractClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

/**
 * Produces a privacy-preserving salted SHA-256 hash of a client IP.
 * Never store raw IP addresses in the database.
 */
export function hashIp(ip: string, salt: string): string {
  return crypto
    .createHmac("sha256", salt)
    .update(ip)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Computes a deterministic content fingerprint for an inquiry to block duplicate
 * submissions within the deduplication window without storing duplicate payloads.
 */
export function computeInquiryFingerprint(
  payload: {
    email: string;
    eventName: string;
    selectedServices: string[];
    eventDate?: string;
    projectDetails: string;
  },
  salt: string
): string {
  const canonical = [
    payload.email.trim().toLowerCase(),
    payload.eventName.trim().toLowerCase(),
    [...payload.selectedServices].sort().join(","),
    (payload.eventDate || "").trim(),
    payload.projectDetails
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 240),
  ].join("|");

  return crypto
    .createHmac("sha256", salt)
    .update(canonical)
    .digest("hex")
    .slice(0, 40);
}

/**
 * Generates a cryptographically random, human-readable booking inquiry reference code.
 * Example: ORB-2026-K8M4Q2
 */
export function generateReferenceCode(): string {
  const year = new Date().getUTCFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[(bytes[i] ?? 0) % alphabet.length];
  }
  return `ORB-${year}-${suffix}`;
}

/**
 * Validates that a mutating request originated from the same host/origin.
 * Enforces `Sec-Fetch-Site` rejection on cross-site browser requests and checks
 * `Origin` (with `Referer` fallback) against `Host` and `NEXT_PUBLIC_SITE_URL`.
 */
export function isAllowedOrigin(
  headers: Headers,
  configuredSiteUrl: string
): boolean {
  const secFetchSite = headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "cross-site") {
    return false;
  }

  const origin = headers.get("origin");
  const referer = headers.get("referer");
  const sourceHeader = origin || referer;

  if (!sourceHeader) {
    // Require Origin or Referer on production mutating requests from browsers
    return process.env.NODE_ENV !== "production";
  }

  try {
    const sourceUrl = new URL(sourceHeader);
    const hostHeader = headers.get("host");
    if (hostHeader && sourceUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
      return true;
    }
    const configured = new URL(configuredSiteUrl);
    return sourceUrl.origin.toLowerCase() === configured.origin.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Recursively detects prototype-pollution keys in untrusted parsed JSON.
 */
export function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 8 || value === null || typeof value !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((item) => hasDangerousKeys(item, depth + 1));
  }
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return true;
    }
    if (hasDangerousKeys((value as Record<string, unknown>)[key], depth + 1)) {
      return true;
    }
  }
  return false;
}

export type BoundedJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 413; error: string };

/**
 * Streams a request body while enforcing a hard byte cap chunk-by-chunk,
 * preventing memory exhaustion on chunked Transfer-Encoding payloads,
 * then safely parses JSON and rejects prototype-pollution keys.
 */
export async function readBoundedJsonBody(
  request: Request,
  maxBytes: number,
  options?: { allowEmpty?: boolean }
): Promise<BoundedJsonResult> {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (!Number.isNaN(declared) && declared > maxBytes) {
      return {
        ok: false,
        status: 413,
        error: "Request payload exceeds the maximum allowed size.",
      };
    }
  }

  if (!request.body) {
    if (options?.allowEmpty) return { ok: true, data: {} };
    return { ok: false, status: 400, error: "Request body is required." };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          status: 413,
          error: "Request payload exceeds the maximum allowed size.",
        };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: "Unable to read request body." };
  }

  if (totalBytes === 0) {
    if (options?.allowEmpty) return { ok: true, data: {} };
    return { ok: false, status: 400, error: "Request body cannot be empty." };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    const rawText = new TextDecoder("utf-8", { fatal: true }).decode(combined);
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON payload." };
  }

  if (hasDangerousKeys(parsed)) {
    return { ok: false, status: 400, error: "Invalid JSON structure." };
  }

  return { ok: true, data: parsed };
}
