/**
 * Server-only environment variables.
 *
 * This module is deliberately NOT re-exported from `@/config` so that secrets
 * such as the Supabase service-role key never end up in client bundles.
 * Import it only in server-side code (Server Actions, Server Components, API routes).
 */

export const serverEnv = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;
