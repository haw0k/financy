'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/require-auth';
import { routes, getSupabaseRedirectUrl } from '@/config';
import { ERole, EProfileStatus } from '@/enums';
import { loginSchema, signUpSchema } from '@/schemas';
import type { TLoginInput, TSignUpInput } from '@/schemas';
import type { TAuthResult, TActionResult } from '@/types';
import { mapSupabaseError } from '@/lib/db-errors';
import { AUTH_MSGS } from '@/messages';

export async function loginAction({
  email,
  password,
}: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  redirect(routes.dashboard);
}

export async function signUpAction({
  email,
  password,
  role,
}: TSignUpInput): Promise<TAuthResult> {
  const parsed = signUpSchema.safeParse({ email, password, role });
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
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  redirect(routes.signUpSuccess);
}

export async function adminLoginAction({
  email,
  password,
}: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  redirect(routes.admin);
}

export async function adminSignUpAction({
  email,
  password,
}: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Check if an approved admin already exists (only one admin allowed)
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', ERole.Admin)
    .eq('status', EProfileStatus.Approved)
    .limit(1)
    .maybeSingle();

  if (existingAdmin) {
    return { isSuccess: false, error: AUTH_MSGS.ADMIN_ACCOUNT_EXISTS };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: getSupabaseRedirectUrl(),
      data: { role: ERole.Admin },
    },
  });

  if (error) {
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  return { isSuccess: true };
}

export async function signOutAction(): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.auth.signOut();

  if (error) {
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  return { isSuccess: true };
}

/**
 * Retrieves the current user's role and profile status from the server session.
 *
 * @returns `isSuccess: true` with the user's role/status, or `isSuccess: false` if not authenticated.
 */
export async function getRoleAction(): Promise<TActionResult<{ role: ERole | null; status: EProfileStatus | null }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isSuccess: false, error: AUTH_MSGS.NOT_AUTHENTICATED };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return {
    isSuccess: true,
    data: {
      role: (profile?.role as ERole) ?? null,
      status: (profile?.status as EProfileStatus) ?? null,
    },
  };
}
