import "server-only";
import { getServerEnv } from "@/lib/env";
import { secureLog } from "@/lib/logger";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
}

export interface TurnstileResult {
  success: boolean;
  skipped?: boolean;
  reason?: string;
}

const TURNSTILE_VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile response token strictly on the server.
 * - In production: fails closed if secret key is missing, token fails, or hostname mismatches.
 * - In local development without configured keys: gracefully skips so forms can be tested locally.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp: string
): Promise<TurnstileResult> {
  const env = getServerEnv();
  const secretKey = env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    if (env.NODE_ENV === "production") {
      secureLog("error", {
        event: "turnstile_secret_missing",
        route: "/api/inquiries",
        code: "CONFIG_ERROR",
      });
      return {
        success: false,
        reason: "Bot verification is temporarily unavailable.",
      };
    }
    return { success: true, skipped: true };
  }

  if (!token || token.trim().length < 10) {
    return {
      success: false,
      reason: "Please complete the human verification check.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const formData = new URLSearchParams();
    formData.set("secret", secretKey);
    formData.set("response", token);
    if (remoteIp && remoteIp !== "127.0.0.1") {
      formData.set("remoteip", remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      secureLog("warn", {
        event: "turnstile_upstream_error",
        route: "/api/inquiries",
        statusCode: response.status,
      });
      return {
        success: false,
        reason: "Verification service unavailable. Please try again.",
      };
    }

    const data = (await response.json()) as TurnstileVerifyResponse;
    if (!data.success) {
      secureLog("warn", {
        event: "turnstile_rejected",
        route: "/api/inquiries",
        code: data["error-codes"]?.[0] || "UNKNOWN",
      });
      return {
        success: false,
        reason: "Human verification failed. Please retry the check.",
      };
    }

    // Verify Turnstile hostname in production (prevents cross-domain token reuse)
    if (env.NODE_ENV === "production" && data.hostname) {
      try {
        const expectedHost = new URL(env.NEXT_PUBLIC_SITE_URL).hostname.toLowerCase();
        const returnedHost = data.hostname.toLowerCase();
        if (
          expectedHost !== "localhost" &&
          returnedHost !== expectedHost &&
          !returnedHost.endsWith(`.${expectedHost}`)
        ) {
          secureLog("warn", {
            event: "turnstile_hostname_mismatch",
            route: "/api/inquiries",
            code: "HOSTNAME_MISMATCH",
          });
          return {
            success: false,
            reason: "Verification token is not valid for this domain.",
          };
        }
      } catch {
        // Ignore URL parse error; env.NEXT_PUBLIC_SITE_URL is already Zod-validated
      }
    }

    return { success: true };
  } catch {
    secureLog("warn", {
      event: "turnstile_timeout",
      route: "/api/inquiries",
      code: "TIMEOUT",
    });
    return {
      success: false,
      reason: "Verification timed out. Please try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
