'use server';

import { redirect } from 'next/navigation';
import { routes, getSupabaseRedirectUrl } from '@/config';
import { ERole, EProfileStatus } from '@/enums';
import { loginSchema, signUpSchema } from '@/schemas';
import type { TLoginInput, TSignUpInput } from '@/schemas';
import type { TAuthResult } from '@/types';
import { AUTH_MSGS } from '@/messages';
import { createClient } from '@/lib/supabase/server';
import { mapSupabaseError } from '@/lib/db-errors';

/**
 * Normalizes a Supabase Auth error into a user-facing message.
 *
 * Uses `mapSupabaseError` for database errors but handles Auth errors separately:
 * `mapSupabaseError` falls back to a generic 'An error occurred', while auth actions
 * need the specific AUTH_MSGS.AUTH_FAILED fallback for consistency with the login/signup UI.
 */
function normalizeAuthError(error: { message?: string }): string {
  return error.message || AUTH_MSGS.AUTH_FAILED;
}

/**
 * Shared sign-in flow for {@link loginAction} and {@link adminLoginAction}.
 *
 * Validates credentials, authenticates via Supabase, and redirects on success.
 * On failure returns a {@link TAuthResult} with the error message.
 * On success calls `redirect()` which throws `NEXT_REDIRECT` — the caller never
 * receives a return value in the success case.
 */
async function signInAndRedirect(
  credentials: TLoginInput,
  redirectTo: string,
): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  redirect(redirectTo);
}

export async function loginAction(credentials: TLoginInput): Promise<TAuthResult> {
  return signInAndRedirect(credentials, routes.dashboard);
}

/**
 * Regular user sign-up.
 *
 * Intentionally does NOT pass `emailRedirectTo` — the Supabase project setting
 * handles confirmation emails for regular users. Only admin sign-up uses
 * `emailRedirectTo` to point at the in-app callback route.
 */
export async function signUpAction(input: TSignUpInput): Promise<TAuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { role: parsed.data.role } },
  });

  if (error) {
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  redirect(routes.signUpSuccess);
}

export async function adminLoginAction(credentials: TLoginInput): Promise<TAuthResult> {
  return signInAndRedirect(credentials, routes.admin);
}

/**
 * Admin sign-up with single-admin enforcement.
 *
 * Flow:
 * 1. Validate input (email + password via loginSchema)
 * 2. Check redirect URL env var — fail early to avoid wasted work
 * 3. Pre-check: query profiles for an existing approved admin (fast-path error)
 * 4. Sign up via Supabase Auth — DB trigger creates profile with status = 'pending'
 * 5. Admin confirms email → `handle_email_confirmation` trigger sets status = 'approved'
 *
 * Single-admin enforcement is two-layered:
 * - App-level pre-check (step 3): catches the common non-concurrent case with a
 *   friendly AUTH_MSGS.ADMIN_ACCOUNT_EXISTS message. Only checks for approved admins,
 *   so a pending admin (who lost their confirmation email) does not block re-registration.
 * - DB-level unique partial index `idx_profiles_single_approved_admin`: blocks
 *   concurrent confirmations — if two admins register and both confirm email, only
 *   the first becomes approved.
 */
export async function adminSignUpAction(input: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  // Validate env var before creating the Supabase client — avoids wasted
  // cookie-store read and client construction when the URL is missing.
  const redirectUrl = getSupabaseRedirectUrl();
  if (!redirectUrl) {
    return { isSuccess: false, error: AUTH_MSGS.REDIRECT_URL_NOT_CONFIGURED };
  }

  const supabase = await createClient();

  // Pre-check: query for an existing approved admin.
  // The unique partial index idx_profiles_single_approved_admin is the real
  // enforcer against concurrent signups; this check provides a better error
  // message for the common (non-concurrent) case.
  const { data: existingAdmin, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', ERole.Admin)
    .eq('status', EProfileStatus.Approved)
    .limit(1)
    .maybeSingle();

  if (profileError) {
    return { isSuccess: false, error: mapSupabaseError(profileError) };
  }

  if (existingAdmin) {
    return { isSuccess: false, error: AUTH_MSGS.ADMIN_ACCOUNT_EXISTS };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: { role: ERole.Admin },
    },
  });

  if (error) {
    // Best-effort mapping of unique index violation to a friendly message.
    // Supabase Auth wraps trigger failures as 'Database error saving new user'
    // and may not expose the Postgres constraint name, so this check can miss
    // the TOCTOU race survivor. When it misses, normalizeAuthError returns a
    // generic message — acceptable because the race requires two simultaneous
    // first-admin signups, which is rare in practice.
    if (
      error.message?.includes('duplicate') ||
      error.message?.includes('idx_profiles_single_approved_admin')
    ) {
      return { isSuccess: false, error: AUTH_MSGS.ADMIN_ACCOUNT_EXISTS };
    }
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  return { isSuccess: true };
}

/**
 * Signs out the current user and redirects to the login page.
 *
 * Mixed control flow:
 * - On error: returns `{ isSuccess: false, error }` so callers can show a toast
 * - On success: calls `redirect(routes.login)` which throws `NEXT_REDIRECT` —
 *   the function never returns a value, and callers only reach the error branch
 *
 * Cookie clearing is reliable in Server Actions: Next.js sets `phase = 'action'`
 * before invoking the action, so `cookies().set()` is mutable and `setAll` cannot
 * fail with a read-only error. The `try/catch` in `createClient`'s `setAll` exists
 * only as a guard against accidental use in Server Components.
 */
export async function signOutAction(): Promise<TAuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  redirect(routes.login);
}

