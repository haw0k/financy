export const env = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  devSupabaseRedirectUrl: process.env.DEV_SUPABASE_REDIRECT_URL,
  supabaseRedirectUrl: process.env.SUPABASE_REDIRECT_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;

export function getSupabaseRedirectUrl(): string | undefined {
  if (process.env.NODE_ENV === 'development') {
    return env.devSupabaseRedirectUrl;
  }
  return env.supabaseRedirectUrl ?? undefined;
}

