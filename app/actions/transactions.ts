'use server';

import { mapSupabaseError } from '@/lib/db-errors';
import { requireAuth } from '@/lib/require-auth';
import { AUTH_MSGS } from '@/messages';
import type { TAuthResult } from '@/types';
import type { TActionResult } from '@/types';
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number().positive({ error: 'Amount must be positive' }),
  type: z.enum(['income', 'expense'], { error: AUTH_MSGS.INVALID_ROLE }),
  date: z.string().min(1, { error: 'Date is required' }),
  description: z.string().nullable(),
  receiverId: z.string().optional(),
});

export async function getTransactionsAction(): Promise<
  TActionResult<
    {
      id: string;
      amount: number;
      type: 'income' | 'expense';
      date: string;
      description: string | null;
      category_id: string | null;
      sender_id: string;
      receiver_id: string;
    }[]
  >
> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase.from('transactions').select('*').order('date', { ascending: false });

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

export async function getTransactionsDataAction(): Promise<{
  transactions: {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    description: string | null;
    category_id: string | null;
    sender_id: string;
    receiver_id: string;
  }[];
  categories: { id: string; name: string; type: 'income' | 'expense'; color: string; type_id?: string }[];
  categoryTypes: { id: string; name: string }[];
}> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    throw new Error(authResult.error);
  }

  const [transResult, catResult, catTypeResult] = await Promise.all([
    authResult.supabase.from('transactions').select('*').order('date', { ascending: false }),
    authResult.supabase.from('categories').select('*').order('name'),
    authResult.supabase.from('category_types').select('*').order('name'),
  ]);

  return {
    transactions: transResult.data ?? [],
    categories: catResult.data ?? [],
    categoryTypes: catTypeResult.data ?? [],
  };
}

export async function getReceiversAction({
  userId,
}: {
  userId: string;
}): Promise<TActionResult<{ id: string; email: string }[]>> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase.from('profiles').select('id, email').neq('id', userId);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}

export async function createTransactionAction(
  input: z.infer<typeof transactionSchema>,
): Promise<TAuthResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('transactions').insert([
    {
      sender_id: authResult.userId,
      amount: parsed.data.amount,
      type: parsed.data.type,
      date: parsed.data.date,
      description: parsed.data.description,
      receiver_id: parsed.data.receiverId ?? null,
    },
  ]);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function updateTransactionAction({
  id,
  input,
}: {
  id: string;
  input: z.infer<typeof transactionSchema>;
}): Promise<TAuthResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase
    .from('transactions')
    .update({
      amount: parsed.data.amount,
      type: parsed.data.type,
      date: parsed.data.date,
      description: parsed.data.description,
      receiver_id: parsed.data.receiverId ?? null,
    })
    .eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}

export async function deleteTransactionAction({ id }: { id: string }): Promise<TAuthResult> {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { error } = await authResult.supabase.from('transactions').delete().eq('id', id);

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true };
}