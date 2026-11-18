import "server-only";
import { z } from "zod";
import { secureLog } from "@/lib/logger";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().default(""),
  TURNSTILE_SECRET_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: z
    .string()
    .optional()
    .default("ORBIT Studio <onboarding@resend.dev>"),
  INQUIRY_RECIPIENT_EMAIL: z
    .string()
    .email()
    .optional()
    .default("bookings@orbitagency.example"),
  SEND_CLIENT_CONFIRMATION: z
    .enum(["true", "false"])
    .optional()
    .default("true"),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  IP_HASH_SALT: z.string().optional().default("orbit-local-dev-salt"),
  PORTFOLIO_REVALIDATE_SECRET: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;
let warnedWeakSalt = false;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    RESEND_FROM_EMAIL:
      process.env.RESEND_FROM_EMAIL || "ORBIT Studio <onboarding@resend.dev>",
    INQUIRY_RECIPIENT_EMAIL:
      process.env.INQUIRY_RECIPIENT_EMAIL || "bookings@orbitagency.example",
    SEND_CLIENT_CONFIRMATION:
      process.env.SEND_CLIENT_CONFIRMATION === "false" ? "false" : "true",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    IP_HASH_SALT: process.env.IP_HASH_SALT || "orbit-local-dev-salt",
    PORTFOLIO_REVALIDATE_SECRET: process.env.PORTFOLIO_REVALIDATE_SECRET || "",
  });

  if (!parsed.success) {
    secureLog("error", {
      event: "env_validation_failed",
      code: "INVALID_ENV",
    });
    throw new Error("Server environment validation failed.");
  }

  if (
    parsed.data.NODE_ENV === "production" &&
    !warnedWeakSalt &&
    (parsed.data.IP_HASH_SALT === "orbit-local-dev-salt" ||
      parsed.data.IP_HASH_SALT.length < 16)
  ) {
    warnedWeakSalt = true;
    secureLog("warn", {
      event: "weak_ip_hash_salt_detected",
      code: "CONFIG_WARNING",
    });
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isSupabaseConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseAdminConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
      env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  return Boolean(cloudName && cloudName !== "your-cloudinary-cloud-name");
}
