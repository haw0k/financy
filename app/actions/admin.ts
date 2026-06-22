'use server';

import { z } from 'zod';

import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedAdmin } from '@/lib/require-auth';
import { createAdminClient } from '@/lib/supabase/admin';

import { EProfileStatus, ERole } from '@/enums';
import { ADMIN_MSGS } from '@/messages';
import type { TActionResult } from '@/types';

const userIdSchema = z.string().uuid({ message: ADMIN_MSGS.INVALID_USER_ID });

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
  const adminResult = await requireApprovedAdmin();
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

export async function approveUserAction({
  userId,
}: {
  userId: string;
}): Promise<TActionResult<void>> {
  const adminResult = await requireApprovedAdmin();
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

  const adminClient = createAdminClient();

  // Confirm the email first. If this fails, the user remains pending and can be
  // approved again later; we never leave them "approved but unable to log in".
  const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (confirmError) {
    return { isSuccess: false, error: mapSupabaseError(confirmError) };
  }

  // Now that the email is confirmed, mark the profile as approved.
  // The DB trigger handle_profile_update will sync the new status into JWT
  // app_metadata, so the user's next auth exchange sees the approved state.
  const { error: statusError } = await adminResult.supabase
    .from('profiles')
    .update({ status: EProfileStatus.Approved })
    .eq('id', userId);

  if (statusError) {
    return { isSuccess: false, error: ADMIN_MSGS.APPROVE_STATUS_FAILED };
  }

  return { isSuccess: true, data: undefined };
}

export async function rejectUserAction({
  userId,
}: {
  userId: string;
}): Promise<TActionResult<void>> {
  const adminResult = await requireApprovedAdmin();
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
