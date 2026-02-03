import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Return cached client if available
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time, env vars might not be available
  // Return a placeholder that will be replaced at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      // We're on the server during build - return a mock client
      // This allows static generation to complete
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Not configured" } }),
          signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: { message: "Not configured" } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: "Not configured" } }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({ data: null, error: null, eq: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
          delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
        }),
      } as unknown as SupabaseClient;
    }
    throw new Error("Supabase environment variables are not configured");
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
