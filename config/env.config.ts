export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  devSupabaseRedirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
} as const;
