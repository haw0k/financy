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
  redirectTo: string
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
 * Uses `emailRedirectTo` pointing at the in-app callback route so the email
 * confirmation link always lands in a page we control, regardless of the
 * Supabase project Site URL.
 */
export async function signUpAction(input: TSignUpInput): Promise<TAuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const redirectUrl = getSupabaseRedirectUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Always redirect back to the app callback so the email confirmation link
      // lands in a page we control, regardless of the Supabase project Site URL.
      emailRedirectTo: redirectUrl ? `${redirectUrl}?next=/dashboard` : undefined,
      data: { role: parsed.data.role },
    },
  });

  if (error) {
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  redirect(routes.signUpSuccess);
}

export async function adminLoginAction(credentials: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  // Only approved/pending admins should ever land on /admin. Non-admin users
  // that typed their credentials on /auth/admin are redirected straight to
  // their own dashboard, avoiding the /admin → /dashboard middleware hop and
  // the possibility of flashing the admin layout/menu.
  const appMetadata = data.user?.app_metadata as { role?: string } | undefined;
  const roleFromJwt = appMetadata?.role;

  // Fall back to the profiles table if the JWT app_metadata is stale or missing
  // (e.g. sessions created before the metadata migration).
  let resolvedRole = roleFromJwt;
  let resolvedStatus: EProfileStatus | null | undefined;
  if (resolvedRole !== ERole.Admin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .maybeSingle();
    resolvedRole = profile?.role ?? resolvedRole;
    resolvedStatus = profile?.status as EProfileStatus | undefined;
  }

  if (resolvedRole !== ERole.Admin) {
    redirect(routes.dashboard);
  }

  // Pending admins (email not yet confirmed) should land on /auth/pending,
  // not on /admin, because middleware would reject them anyway.
  const isPendingAdmin =
    resolvedStatus === EProfileStatus.Pending ||
    (resolvedRole === ERole.Admin && !data.user.email_confirmed_at);
  if (isPendingAdmin) {
    redirect(routes.pending);
  }

  redirect(routes.admin);
}

/**
 * Admin sign-up with single-admin enforcement.
 *
 * Flow:
 * 1. Validate input (email + password via loginSchema)
 * 2. Pre-check: query profiles for an existing approved admin (fast-path error)
 * 3. Check redirect URL env var
 * 4. Sign up via Supabase Auth — DB trigger creates profile with status = 'pending'
 * 5. Admin confirms email → `handle_email_confirmation` trigger sets status = 'approved'
 *
 * Single-admin enforcement is two-layered:
 * - App-level pre-check (step 2): catches the common non-concurrent case with a
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

  const supabase = await createClient();

  // Pre-check: query for an existing approved admin. Run this before any
  // configuration checks so we do not leak environment state to unauthenticated
  // visitors who are simply probing the admin registration endpoint.
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

  // Resolve redirect URL from the configured env var only. Building it from
  // request headers would allow host-header injection and open redirects in
  // the confirmation email link.
  const redirectUrl = getSupabaseRedirectUrl();
  if (!redirectUrl) {
    return { isSuccess: false, error: AUTH_MSGS.REDIRECT_URL_NOT_CONFIGURED };
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
    // Supabase Auth masks DB trigger errors as:
    //   { code: "unexpected_failure", status: 500, message: "Database error saving new user" }
    // The Postgres error code (23505) and constraint name are NOT exposed.
    // The pre-check above already handles the common non-concurrent case with
    // a friendly ADMIN_ACCOUNT_EXISTS message. For the rare TOCTOU race survivor,
    // a generic error is acceptable — the race requires two simultaneous first-admin
    // signups, and the DB unique partial index is the real enforcer.
    return { isSuccess: false, error: normalizeAuthError(error) };
  }

  return { isSuccess: true };
}

/**
 * Signs out the current user and redirects to the login page.
 *
 * `signOut()` returns an error object on failure rather than throwing. We still
 * redirect on error because the session cookie is cleared client-side and the
 * user should land on the login page, but we log the failure for observability.
 * `redirect()` throws `NEXT_REDIRECT`, so this function never returns.
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Log for observability but continue to redirect: the cookie will be
    // cleared by the browser/middleware on the next request.
    console.error('Sign out failed:', error.message);
  }
  redirect(routes.login);
}
