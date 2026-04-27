import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config';

export function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
