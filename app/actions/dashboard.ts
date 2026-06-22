'use server';

import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';

import type { ITransaction } from '@/interfaces';
import type { TActionResult } from '@/types';

export async function getDashboardDataAction(): Promise<
  TActionResult<{
    transactions: ITransaction[];
    stats: { total_balance: number; total_income: number; total_expense: number } | null;
    statsError?: string;
  }>
> {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const [transactionsResult, statsResult] = await Promise.all([
    authResult.supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(10),
    authResult.supabase.rpc('get_user_stats'),
  ]);

  if (transactionsResult.error) {
    return { isSuccess: false, error: mapSupabaseError(transactionsResult.error) };
  }

  let stats: { total_balance: number; total_income: number; total_expense: number } | null = null;
  let statsError: string | undefined;

  if (statsResult.error) {
    statsError = mapSupabaseError(statsResult.error);
  } else {
    stats = Array.isArray(statsResult.data) ? statsResult.data[0] : statsResult.data;
  }

  return {
    isSuccess: true,
    data: {
      transactions: transactionsResult.data ?? [],
      stats,
      ...(statsError && { statsError }),
    },
  };
}
