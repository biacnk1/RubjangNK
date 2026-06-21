import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  
  // Only use the /supabase-api rewrite proxy if we are on the client-side AND 
  // the Supabase URL points to a local environment (localhost, 127.0.0.1, or local IP).
  // For remote production (e.g. Supabase Cloud), connect directly over HTTPS.
  const isLocal = supabaseUrl.includes('localhost') || 
                  supabaseUrl.includes('127.0.0.1') || 
                  supabaseUrl.includes('192.168.');
                  
  const url = (typeof window !== 'undefined' && isLocal)
    ? '/supabase-api'
    : supabaseUrl;

  return createBrowserClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  );
}
