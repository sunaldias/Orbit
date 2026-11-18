import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, isSupabaseAdminConfigured } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client authenticated with SUPABASE_SERVICE_ROLE_KEY.
 * Used exclusively by hardened API routes after rate-limiting, Turnstile verification,
 * and Zod validation. Never import this file in client components.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (adminClient) return adminClient;

  const env = getServerEnv();
  adminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
  return adminClient;
}
