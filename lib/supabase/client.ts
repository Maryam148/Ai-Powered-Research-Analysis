import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use dummy values during build if env vars are missing
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createBrowserClient(url, anonKey);
}
