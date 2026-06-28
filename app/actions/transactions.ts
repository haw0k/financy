'use server';

import { cacheTag, cacheLife as nextCacheLife, revalidatePath, revalidateTag } from 'next/cache';
import { mapSupabaseError } from '@/lib/db-errors';
import { convertToUsd } from '@/lib/exchange-rate';
import { requireApprovedUser } from '@/lib/require-auth';
import { createClient } from '@/lib/supabase/server';
import { CACHE_TAGS, dashboardCacheLife, mutationRevalidateProfile } from '@/config';
import { ECurrency, EProfileStatus, ERole } from '@/enums';
import { transactionSchema } from '@/schemas';
import { TRANSACTION_MSGS } from '@/messages';
import type { TTransactionInput } from '@/schemas';
import type { ICategory, ICategoryType, ITransaction } from '@/interfaces';
import type { TActionResult } from '@/types';

type TSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Re-calculates and validates the USD-equivalent amount on the server. This
 * prevents clients from tampering with `amountUsd` while still allowing them to
 * edit the exchange rate manually (for example, when a bank API is unavailable).
 */
async function validateUsdAmount(
  supabase: TSupabaseClient,
  input: TTransactionInput
): Promise<{ isValid: false; error: string } | { isValid: true }> {
  const { data: currency, error: currencyError } = await supabase
    .from('currencies')
    .select('code')
    .eq('id', input.currencyId)
    .maybeSingle();

  if (currencyError) {
    return { isValid: false, error: mapSupabaseError(currencyError) };
  }
  if (!currency) {
    return { isValid: false, error: TRANSACTION_MSGS.INVALID_CURRENCY };
  }

  const expectedAmountUsd =
    currency.code === ECurrency.USD ? input.amount : convertToUsd(input.amount, input.exchangeRate);
  if (Math.abs(expectedAmountUsd - input.amountUsd) > 0.01) {
    return { isValid: false, error: TRANSACTION_MSGS.INVALID_USD_AMOUNT };
  }

  return { isValid: true };
}

export async function getTransactionsDataAction(): Promise<
  TActionResult<{
    transactions: ITransaction[];
    categories: ICategory[];
    categoryTypes: ICategoryType[];
  }>
> {
  // Intentionally not cached: the transactions table must reflect edits
  // made via TransactionForm immediately without waiting for tag expiry.
  const authResult = await requireApprovedUser();
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
  'use cache: private';
  cacheTag(CACHE_TAGS.receivers);
  nextCacheLife(dashboardCacheLife);

  const authResult = await requireApprovedUser();
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
export async function createTransactionAction(
  input: TTransactionInput
): Promise<TActionResult<void>> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const validation = await validateUsdAmount(authResult.supabase, parsed.data);
  if (!validation.isValid) {
    return { isSuccess: false, error: validation.error };
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
    if (!receiver || (Array.isArray(receiver) && receiver.length === 0)) {
      return { isSuccess: false, error: TRANSACTION_MSGS.INVALID_RECEIVER };
    }
  }

  const { error } = await authResult.supabase.from('transactions').insert([
    {
      sender_id: authResult.userId,
      amount: parsed.data.amount,
      currency_id: parsed.data.currencyId,
      exchange_rate: parsed.data.exchangeRate,
      rate_provider: parsed.data.rateProvider,
      amount_usd: parsed.data.amountUsd,
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

  revalidateTag(CACHE_TAGS.transactions, mutationRevalidateProfile);
  revalidateTag(CACHE_TAGS.dashboard, mutationRevalidateProfile);
  revalidatePath('/dashboard/transactions');

  return { isSuccess: true, data: undefined };
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
}): Promise<TActionResult<void>> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const validation = await validateUsdAmount(authResult.supabase, parsed.data);
  if (!validation.isValid) {
    return { isSuccess: false, error: validation.error };
  }

  // Validate receiverId against approved, non-admin receivers.
  // When receiverId is not provided for an update, omit receiver_id from the
  // payload to preserve the existing value (unlike create, which defaults to
  // the authenticated user for self-transfers).
  const updatePayload: Partial<ITransaction> = {
    amount: parsed.data.amount,
    currency_id: parsed.data.currencyId,
    exchange_rate: parsed.data.exchangeRate,
    rate_provider: parsed.data.rateProvider,
    amount_usd: parsed.data.amountUsd,
    type: parsed.data.type,
    date: parsed.data.date,
    description: parsed.data.description,
    category_id: parsed.data.categoryId ?? null,
  };

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
      return { isSuccess: false, error: TRANSACTION_MSGS.INVALID_RECEIVER };
    }
    updatePayload.receiver_id = parsed.data.receiverId;
  }

  const { data: updated, error } = await authResult.supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', id)
    .select('id');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }
  if (!updated?.length) {
    return { isSuccess: false, error: TRANSACTION_MSGS.NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.transactions, mutationRevalidateProfile);
  revalidateTag(CACHE_TAGS.dashboard, mutationRevalidateProfile);
  revalidatePath('/dashboard/transactions');

  return { isSuccess: true, data: undefined };
}

/**
 * Deletes a transaction by ID.
 *
 * Ownership checks are intentionally absent — any authenticated user can delete
 * any transaction. See CLAUDE.md for the permissions model.
 */
export async function deleteTransactionAction({
  id,
}: {
  id: string;
}): Promise<TActionResult<void>> {
  const authResult = await requireApprovedUser();
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
    return { isSuccess: false, error: TRANSACTION_MSGS.NOT_FOUND };
  }

  revalidateTag(CACHE_TAGS.transactions, mutationRevalidateProfile);
  revalidateTag(CACHE_TAGS.dashboard, mutationRevalidateProfile);
  revalidatePath('/dashboard/transactions');

  return { isSuccess: true, data: undefined };
}
