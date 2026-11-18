import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { secureLog } from "@/lib/logger";
import {
  claimInquiryDeduplicationLock,
  enforceInquiryEmailRateLimit,
  enforceInquiryIpRateLimit,
  releaseInquiryDeduplicationLock,
} from "@/lib/rate-limit";
import { dispatchInquiryEmails } from "@/lib/resend";
import {
  computeInquiryFingerprint,
  extractClientIp,
  generateReferenceCode,
  hashIp,
  isAllowedOrigin,
  readBoundedJsonBody,
} from "@/lib/security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { inquirySchema } from "@/schemas/inquiry";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024; // 16 KB hard streaming payload cap
const DUPLICATE_LOOKBACK_MS = 15 * 60 * 1000; // 15-minute DB duplicate check window

const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
};

function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>
) {
  return NextResponse.json(
    { ok: false, error: message, ...extra },
    { status, headers: { ...NO_STORE_HEADERS, ...headers } }
  );
}

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const clientIp = extractClientIp(request.headers);
  const ipHash = hashIp(clientIp, env.IP_HASH_SALT);

  // 1. Enforce Origin / Sec-Fetch-Site CSRF protection
  if (!isAllowedOrigin(request.headers, env.NEXT_PUBLIC_SITE_URL)) {
    secureLog("warn", {
      event: "inquiry_origin_rejected",
      route: "/api/inquiries",
      statusCode: 403,
      ipHashPrefix: ipHash,
    });
    return jsonError("Cross-origin requests are not permitted.", 403, {
      code: "FORBIDDEN_ORIGIN",
    });
  }

  // 2. Enforce JSON Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("Content-Type must be application/json.", 415, {
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  }

  // 3. IP Rate Limiting (Upstash Redis sliding window) before parsing body
  const ipLimit = await enforceInquiryIpRateLimit(ipHash);
  if (!ipLimit.allowed) {
    const retryAfter = Math.max(
      1,
      ipLimit.resetUnixSec - Math.floor(Date.now() / 1000)
    );
    secureLog("warn", {
      event: "inquiry_ip_rate_limited",
      route: "/api/inquiries",
      statusCode: 429,
      ipHashPrefix: ipHash,
    });
    return jsonError(
      "Too many inquiries submitted recently. Please wait a few minutes and try again.",
      429,
      { code: "RATE_LIMITED" },
      { "Retry-After": String(retryAfter) }
    );
  }

  // 4. Streaming hard-bounded JSON body read (blocks oversized chunked DoS & prototype pollution)
  const bounded = await readBoundedJsonBody(request, MAX_BODY_BYTES);
  if (!bounded.ok) {
    return jsonError(bounded.error, bounded.status, {
      code: bounded.status === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_JSON",
    });
  }

  // 5. Authoritative Server-Side Zod Validation & Sanitization
  const parsed = inquirySchema.safeParse(bounded.data);
  if (!parsed.success) {
    return jsonError("Please review the highlighted fields and try again.", 400, {
      code: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const inquiry = parsed.data;

  // 6. Silent Honeypot Defense
  if (inquiry.websiteHoneypot && inquiry.websiteHoneypot.trim().length > 0) {
    secureLog("info", {
      event: "inquiry_honeypot_triggered",
      route: "/api/inquiries",
      statusCode: 200,
      ipHashPrefix: ipHash,
    });
    return NextResponse.json(
      {
        ok: true,
        referenceCode: generateReferenceCode(),
        bookingConfirmed: false,
        acknowledgmentSent: false,
        message: "Your inquiry has been received for review.",
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  }

  // 7. Email-Based Rate Limiting
  const emailLimit = await enforceInquiryEmailRateLimit(inquiry.email);
  if (!emailLimit.allowed) {
    const retryAfter = Math.max(
      1,
      emailLimit.resetUnixSec - Math.floor(Date.now() / 1000)
    );
    secureLog("warn", {
      event: "inquiry_email_rate_limited",
      route: "/api/inquiries",
      statusCode: 429,
      ipHashPrefix: ipHash,
    });
    return jsonError(
      "We have already received multiple inquiries from this email recently. Please allow time for our team to reply.",
      429,
      { code: "RATE_LIMITED" },
      { "Retry-After": String(retryAfter) }
    );
  }

  // 8. Cloudflare Turnstile Server Verification
  const turnstile = await verifyTurnstileToken(inquiry.turnstileToken, clientIp);
  if (!turnstile.success) {
    return jsonError(
      turnstile.reason || "Human verification failed. Please retry.",
      400,
      { code: "TURNSTILE_FAILED" }
    );
  }

  // 9. Multi-Layer Duplicate Submission Prevention (Redis Atomic Lock + DB Check)
  const fingerprint = computeInquiryFingerprint(inquiry, env.IP_HASH_SALT);
  const dedup = await claimInquiryDeduplicationLock(
    inquiry.idempotencyKey,
    fingerprint
  );

  if (dedup.isDuplicate) {
    secureLog("info", {
      event: "inquiry_duplicate_blocked",
      route: "/api/inquiries",
      statusCode: 409,
      code: dedup.reason || "duplicate",
      ipHashPrefix: ipHash,
    });
    return jsonError(
      "This project inquiry was already submitted. Please check your inbox for your acknowledgment email or modify your details before submitting again.",
      409,
      { code: "DUPLICATE_INQUIRY" }
    );
  }

  const supabaseAdmin = getSupabaseAdminClient();
  let insertedId: string | null = null;
  const referenceCode = generateReferenceCode();

  if (supabaseAdmin) {
    const sinceIso = new Date(Date.now() - DUPLICATE_LOOKBACK_MS).toISOString();
    const { data: existingDuplicate } = await supabaseAdmin
      .from("inquiries")
      .select("reference_code")
      .eq("submission_fingerprint", fingerprint)
      .gte("created_at", sinceIso)
      .limit(1)
      .maybeSingle();

    if (existingDuplicate?.reference_code) {
      return jsonError(
        `We already received this inquiry (Reference: ${existingDuplicate.reference_code}). No duplicate request was created.`,
        409,
        {
          code: "DUPLICATE_INQUIRY",
          referenceCode: existingDuplicate.reference_code,
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert({
        reference_code: referenceCode,
        full_name: inquiry.fullName,
        email: inquiry.email,
        phone: inquiry.phone ?? null,
        company_name: inquiry.companyName ?? null,
        selected_services: inquiry.selectedServices,
        event_name: inquiry.eventName,
        event_date: inquiry.eventDate ?? null,
        event_location: inquiry.eventLocation ?? null,
        budget_range: inquiry.budgetRange,
        project_details: inquiry.projectDetails,
        reference_link: inquiry.referenceLink ?? null,
        source_page: inquiry.sourcePage ?? "/booking",
        status: "new",
        email_status: "pending",
        client_ack_status: "pending",
        idempotency_key: inquiry.idempotencyKey ?? null,
        submission_fingerprint: fingerprint,
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonError(
          "This inquiry has already been submitted. Please check your email for your confirmation receipt.",
          409,
          { code: "DUPLICATE_INQUIRY" }
        );
      }

      await releaseInquiryDeduplicationLock(inquiry.idempotencyKey, fingerprint);
      secureLog("error", {
        event: "inquiry_db_insert_failed",
        route: "/api/inquiries",
        statusCode: 500,
        code: error.code || "DB_ERROR",
        ipHashPrefix: ipHash,
      });
      return jsonError(
        "We could not save your inquiry right now. Please try again shortly.",
        500,
        { code: "STORAGE_ERROR" }
      );
    }

    insertedId = data?.id ?? null;
  } else if (env.NODE_ENV === "production") {
    await releaseInquiryDeduplicationLock(inquiry.idempotencyKey, fingerprint);
    secureLog("error", {
      event: "inquiry_db_unconfigured_in_prod",
      route: "/api/inquiries",
      statusCode: 503,
      code: "STORAGE_UNAVAILABLE",
    });
    return jsonError(
      "Inquiry storage is temporarily unavailable. Please contact us directly by email.",
      503,
      { code: "STORAGE_UNAVAILABLE" }
    );
  }

  // 10. Transactional Email Dispatch via Resend (Business Notification + Customer Acknowledgment)
  const emailOutcome = await dispatchInquiryEmails(inquiry, referenceCode);

  if (supabaseAdmin && insertedId) {
    await supabaseAdmin
      .from("inquiries")
      .update({
        email_status: emailOutcome.businessEmailSent ? "sent" : "failed",
        client_ack_status: emailOutcome.clientAckSent ? "sent" : "failed",
        email_error: emailOutcome.businessEmailSent
          ? null
          : (emailOutcome.errorMessage ?? "Delivery failed").slice(0, 500),
      })
      .eq("id", insertedId);
  }

  if (!emailOutcome.businessEmailSent && !insertedId) {
    await releaseInquiryDeduplicationLock(inquiry.idempotencyKey, fingerprint);
    secureLog("error", {
      event: "inquiry_email_delivery_failed",
      route: "/api/inquiries",
      statusCode: 502,
      referenceCode,
      code: "EMAIL_ERROR",
    });
    return jsonError(
      "Unable to deliver your inquiry right now. Please try again or email us directly.",
      502,
      { code: "EMAIL_ERROR" }
    );
  }

  secureLog("info", {
    event: "inquiry_accepted",
    route: "/api/inquiries",
    statusCode: 201,
    referenceCode,
    ipHashPrefix: ipHash,
  });

  return NextResponse.json(
    {
      ok: true,
      referenceCode,
      bookingConfirmed: false,
      acknowledgmentSent: emailOutcome.clientAckSent,
      message:
        "Your project inquiry has been logged for director review. Please note this is an inquiry request—not an automatically confirmed booking. We will reply within 24 business hours.",
    },
    { status: 201, headers: NO_STORE_HEADERS }
  );
}
