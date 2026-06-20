'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { ERole, EProfileStatus } from '@/enums';
import { requireAuth } from '@/lib/require-auth';
import { mapSupabaseError } from '@/lib/db-errors';
import { ADMIN_MSGS } from '@/messages';
import type { TAuthResult, TActionResult } from '@/types';

export async function getPendingUsersAction(): Promise<
  TActionResult<{ id: string; email: string; role: string; created_at: string }[]>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase
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

export async function approveUserAction({ userId }: { userId: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: adminProfile } = await authResult.supabase
    .from('profiles')
    .select('role, status')
    .eq('id', authResult.userId)
    .maybeSingle();

  if (
    !adminProfile ||
    adminProfile.role !== ERole.Admin ||
    adminProfile.status !== EProfileStatus.Approved
  ) {
    return { isSuccess: false, error: ADMIN_MSGS.FORBIDDEN };
  }

  if (!userId) {
    return { isSuccess: false, error: ADMIN_MSGS.USER_ID_REQUIRED };
  }

  if (userId === authResult.userId) {
    return { isSuccess: false, error: ADMIN_MSGS.CANNOT_APPROVE_SELF };
  }

  const adminClient = createAdminClient();

  const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (confirmError) {
    return { isSuccess: false, error: confirmError.message };
  }

  const { error: statusError } = await authResult.supabase
    .from('profiles')
    .update({ status: EProfileStatus.Approved })
    .eq('id', userId);

  if (statusError) {
    console.error('Failed to approve profile after email confirmation:', {
      userId,
      error: statusError,
    });
    return { isSuccess: false, error: ADMIN_MSGS.APPROVE_STATUS_FAILED };
  }

  return { isSuccess: true };
}

export async function rejectUserAction({ userId }: { userId: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: adminProfile } = await authResult.supabase
    .from('profiles')
    .select('role, status')
    .eq('id', authResult.userId)
    .maybeSingle();

  if (
    !adminProfile ||
    adminProfile.role !== ERole.Admin ||
    adminProfile.status !== EProfileStatus.Approved
  ) {
    return { isSuccess: false, error: ADMIN_MSGS.FORBIDDEN };
  }

  if (!userId) {
    return { isSuccess: false, error: ADMIN_MSGS.USER_ID_REQUIRED };
  }

  if (userId === authResult.userId) {
    return { isSuccess: false, error: ADMIN_MSGS.CANNOT_REJECT_SELF };
  }

  const adminClient = createAdminClient();

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return { isSuccess: false, error: deleteError.message };
  }

  return { isSuccess: true };
}
