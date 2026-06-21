import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = typeof window !== 'undefined'
    ? '/supabase-api'
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321');

  return createBrowserClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  );
}
