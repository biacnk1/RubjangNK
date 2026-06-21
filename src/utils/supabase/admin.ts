import { createClient } from '@supabase/supabase-js';

/**
 * Creates a high-privilege Supabase client using the service_role key.
 * This client bypasses Row Level Security (RLS) policies completely.
 * MUST only be used in secure server-side code (Server Actions, API routes).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to initialize the admin client.');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
