import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, isSupabaseConfigured } from "@/lib/env";

let publicClient: SupabaseClient | null = null;

/**
 * Server-side read-only Supabase client using the anon key.
 * Strictly governed by Row Level Security (RLS) — can ONLY read published
 * portfolio projects and active services. Cannot read or write `inquiries`.
 */
export function getSupabasePublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (publicClient) return publicClient;

  const env = getServerEnv();
  publicClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
  return publicClient;
}
