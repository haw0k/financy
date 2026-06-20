'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { ERole, EProfileStatus } from '@/enums';
import { requireAuth } from '@/lib/require-auth';
import { mapSupabaseError } from '@/lib/db-errors';
import { ADMIN_MSGS } from '@/messages';
import type { TActionResult } from '@/types';
import { z } from 'zod';

const userIdSchema = z.string().uuid({ message: ADMIN_MSGS.INVALID_USER_ID });

function isAdminApproved(profile: { role: string; status: string } | null): boolean {
  return !!profile && profile.role === ERole.Admin && profile.status === EProfileStatus.Approved;
}

async function requireAdmin(authResult: Awaited<ReturnType<typeof requireAuth>>): Promise<
  | {
      supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>;
      userId: string;
    }
  | { error: string }
> {
  if ('error' in authResult) {
    return { error: authResult.error };
  }

  const { data: adminProfile } = await authResult.supabase
    .from('profiles')
    .select('role, status')
    .eq('id', authResult.userId)
    .maybeSingle();

  if (!isAdminApproved(adminProfile)) {
    return { error: ADMIN_MSGS.FORBIDDEN };
  }

  return { supabase: authResult.supabase, userId: authResult.userId };
}

async function validateTargetUser(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string
): Promise<{ role: string; status: string } | { error: string }> {
  const parsed = userIdSchema.safeParse(userId);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .maybeSingle();

  if (targetError) {
    return { error: mapSupabaseError(targetError) };
  }

  if (!targetProfile) {
    return { error: ADMIN_MSGS.USER_NOT_PENDING };
  }

  if (targetProfile.role === ERole.Admin) {
    return { error: ADMIN_MSGS.CANNOT_MANAGE_ADMIN };
  }

  if (targetProfile.status !== EProfileStatus.Pending) {
    return { error: ADMIN_MSGS.USER_NOT_PENDING };
  }

  return targetProfile;
}

export async function getPendingUsersAction(): Promise<
  TActionResult<{ id: string; email: string; role: string; created_at: string }[]>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const adminResult = await requireAdmin(authResult);
  if ('error' in adminResult) {
    return { isSuccess: false, error: adminResult.error };
  }

  const { data, error } = await adminResult.supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .eq('status', EProfileStatus.Pending)
    .neq('role', ERole.Admin)
    .order('created_at', { ascending: false });

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

export async function approveUserAction({ userId }: { userId: string }): Promise<TActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const adminResult = await requireAdmin(authResult);
  if ('error' in adminResult) {
    return { isSuccess: false, error: adminResult.error };
  }

  if (userId === adminResult.userId) {
    return { isSuccess: false, error: ADMIN_MSGS.CANNOT_APPROVE_SELF };
  }

  const targetResult = await validateTargetUser(adminResult.supabase, userId);
  if ('error' in targetResult) {
    return { isSuccess: false, error: targetResult.error };
  }

  // Approve the profile first so the user is never left in a half-confirmed state
  // (email confirmed but still pending). The DB trigger handle_profile_update will
  // sync role/status into JWT app_metadata, and the subsequent email_confirm call
  // forces Supabase to refresh the user's JWT on their next auth exchange.
  const { error: statusError } = await adminResult.supabase
    .from('profiles')
    .update({ status: EProfileStatus.Approved })
    .eq('id', userId);

  if (statusError) {
    return { isSuccess: false, error: ADMIN_MSGS.APPROVE_STATUS_FAILED };
  }

  const adminClient = createAdminClient();

  const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (confirmError) {
    return { isSuccess: false, error: mapSupabaseError(confirmError) };
  }

  return { isSuccess: true, data: undefined };
}

export async function rejectUserAction({ userId }: { userId: string }): Promise<TActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const adminResult = await requireAdmin(authResult);
  if ('error' in adminResult) {
    return { isSuccess: false, error: adminResult.error };
  }

  if (userId === adminResult.userId) {
    return { isSuccess: false, error: ADMIN_MSGS.CANNOT_REJECT_SELF };
  }

  const targetResult = await validateTargetUser(adminResult.supabase, userId);
  if ('error' in targetResult) {
    return { isSuccess: false, error: targetResult.error };
  }

  const adminClient = createAdminClient();

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return { isSuccess: false, error: mapSupabaseError(deleteError) };
  }

  return { isSuccess: true, data: undefined };
}
