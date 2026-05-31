'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { routes, getSupabaseRedirectUrl } from '@/config';
import { ERole } from '@/enums';
import { loginSchema, signUpSchema } from '@/schemas';
import type { TLoginInput, TSignUpInput } from '@/schemas';
import type { TAuthResult } from '@/types';
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
