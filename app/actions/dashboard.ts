'use server';

import { mapSupabaseError } from '@/lib/db-errors';
import { requireAuth } from '@/lib/require-auth';
import type { TActionResult } from '@/types';
import type { ITransaction } from '@/interfaces';

export async function getDashboardDataAction(): Promise<
  TActionResult<{
    transactions: ITransaction[];
    stats: { total_balance: number; total_income: number; total_expense: number } | null;
  }>
> {
  const authResult = await requireAuth();
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

  if (statsResult.error) {
    console.warn('[getDashboardDataAction] Stats RPC failed:', statsResult.error.message);
  }

  const stats = statsResult.error
    ? null
    : Array.isArray(statsResult.data)
      ? statsResult.data[0]
      : statsResult.data;

  return {
    isSuccess: true,
    data: {
      transactions: transactionsResult.data ?? [],
      stats,
    },
  };
}
