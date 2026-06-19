'use server';

import { ERole, EProfileStatus } from '@/enums';
import type { ITransaction, ICategory, ICategoryType } from '@/interfaces';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireAuth } from '@/lib/require-auth';
import { transactionSchema } from '@/schemas';
import type { TTransactionInput } from '@/schemas';
import type { TAuthResult, TActionResult } from '@/types';

export async function getTransactionsDataAction(): Promise<
  TActionResult<{
    transactions: ITransaction[];
    categories: ICategory[];
    categoryTypes: ICategoryType[];
  }>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const [transResult, catResult, catTypeResult] = await Promise.all([
    authResult.supabase.from('transactions').select('*').order('date', { ascending: false }),
    authResult.supabase.from('categories').select('*').order('name'),
    authResult.supabase.from('category_types').select('*').order('name'),
  ]);

  if (transResult.error) {
    return { isSuccess: false, error: mapSupabaseError(transResult.error) };
  }
  if (catResult.error) {
    return { isSuccess: false, error: mapSupabaseError(catResult.error) };
  }
  if (catTypeResult.error) {
    return { isSuccess: false, error: mapSupabaseError(catTypeResult.error) };
  }

  return {
    isSuccess: true,
    data: {
      transactions: transResult.data ?? [],
      categories: catResult.data ?? [],
      categoryTypes: catTypeResult.data ?? [],
    },
  };
}

/**
 * Returns profiles eligible to be transaction receivers.
 *
 * Uses the authenticated user's ID from {@link requireAuth} (not a caller-supplied
 * parameter) to prevent email enumeration. Filters out admins and pending users —
 * only approved senders/receivers appear in the dropdown.
 */
export async function getReceiversAction(): Promise<
  TActionResult<{ id: string; email: string }[]>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase
    .from('profiles')
    .select('id, email')
    .neq('id', authResult.userId)
    .neq('role', ERole.Admin)
    .eq('status', EProfileStatus.Approved);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

/**
 * Creates a transaction.
 *
 * When `receiverId` is not provided, defaults to the authenticated user's own ID
 * (self-transfer). This avoids a NOT NULL constraint violation on `receiver_id`
 * while keeping the form field optional.
 *
 * Ownership checks are intentionally absent — RLS is disabled and all authenticated
 * users share the same data pool. See CLAUDE.md for the permissions model.
 */
export async function createTransactionAction(input: TTransactionInput): Promise<TAuthResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  // Validate receiverId against approved, non-admin receivers
  const receiverId = parsed.data.receiverId || authResult.userId;
  if (parsed.data.receiverId) {
    const { data: receiver, error: receiverError } = await authResult.supabase
      .from('profiles')
      .select('id')
      .eq('id', parsed.data.receiverId)
      .neq('role', ERole.Admin)
      .eq('status', EProfileStatus.Approved)
      .maybeSingle();

    if (receiverError) {
      return { isSuccess: false, error: mapSupabaseError(receiverError) };
    }
    if (!receiver) {
      return { isSuccess: false, error: 'Invalid receiver selected' };
    }
  }

  const { error } = await authResult.supabase.from('transactions').insert([
    {
      sender_id: authResult.userId,
      amount: parsed.data.amount,
      type: parsed.data.type,
      date: parsed.data.date,
      description: parsed.data.description,
      category_id: parsed.data.categoryId ?? null,
      receiver_id: receiverId,
    },
  ]);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

/**
 * Updates a transaction by ID.
 *
 * Ownership checks are intentionally absent — any authenticated user can modify
 * any transaction. See CLAUDE.md for the permissions model.
 */
export async function updateTransactionAction({
  id,
  input,
}: {
  id: string;
  input: TTransactionInput;
}): Promise<TAuthResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  // Validate receiverId against approved, non-admin receivers
  const receiverId = parsed.data.receiverId || authResult.userId;
  if (parsed.data.receiverId) {
    const { data: receiver, error: receiverError } = await authResult.supabase
      .from('profiles')
      .select('id')
      .eq('id', parsed.data.receiverId)
      .neq('role', ERole.Admin)
      .eq('status', EProfileStatus.Approved)
      .maybeSingle();

    if (receiverError) {
      return { isSuccess: false, error: mapSupabaseError(receiverError) };
    }
    if (!receiver) {
      return { isSuccess: false, error: 'Invalid receiver selected' };
    }
  }

  const { data: updated, error } = await authResult.supabase
    .from('transactions')
    .update({
      amount: parsed.data.amount,
      type: parsed.data.type,
      date: parsed.data.date,
      description: parsed.data.description,
      category_id: parsed.data.categoryId ?? null,
      receiver_id: receiverId,
    })
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated?.length) {
    return { isSuccess: false, error: 'Transaction not found' };
  }

  return { isSuccess: true };
}

/**
 * Deletes a transaction by ID.
 *
 * Ownership checks are intentionally absent — any authenticated user can delete
 * any transaction. See CLAUDE.md for the permissions model.
 */
export async function deleteTransactionAction({ id }: { id: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data: deleted, error } = await authResult.supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!deleted?.length) {
    return { isSuccess: false, error: 'Transaction not found' };
  }

  return { isSuccess: true };
}
