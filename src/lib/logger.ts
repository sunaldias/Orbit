import "server-only";

export type LogLevel = "info" | "warn" | "error";

export interface SafeLogContext {
  event: string;
  route?: string;
  statusCode?: number;
  code?: string;
  referenceCode?: string;
  ipHashPrefix?: string;
  reason?: string;
}

/**
 * Structured server-side logger with strict field allowlisting.
 * Guarantees that PII (emails, names, phone numbers, raw IPs, project descriptions)
 * and secret credentials are NEVER written to application logs.
 */
export function secureLog(level: LogLevel, context: SafeLogContext): void {
  const entry = {
    ts: new Date().toISOString(),
    service: "orbit-web",
    level,
    event: context.event,
    ...(context.route ? { route: context.route } : {}),
    ...(typeof context.statusCode === "number"
      ? { statusCode: context.statusCode }
      : {}),
    ...(context.code ? { code: context.code } : {}),
    ...(context.referenceCode ? { referenceCode: context.referenceCode } : {}),
    ...(context.ipHashPrefix
      ? { ipHashPrefix: context.ipHashPrefix.slice(0, 10) }
      : {}),
    ...(context.reason ? { reason: context.reason.slice(0, 140) } : {}),
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}
