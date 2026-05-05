export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  devSupabaseRedirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
  supabaseRedirectUrl: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;

export function getSupabaseRedirectUrl(): string | undefined {
  if (process.env.NODE_ENV === 'development') {
    return env.devSupabaseRedirectUrl;
  }
  return env.supabaseRedirectUrl ?? undefined;
}
