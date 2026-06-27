'use server';

import { cacheTag, cacheLife as nextCacheLife } from 'next/cache';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';
import { CACHE_TAGS, dashboardCacheLife } from '@/config';
import type { ICurrency } from '@/interfaces';
import type { TActionResult } from '@/types';

export async function getCurrenciesAction(): Promise<TActionResult<ICurrency[]>> {
  'use cache: private';
  cacheTag(CACHE_TAGS.currencies);
  nextCacheLife(dashboardCacheLife);

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const { data, error } = await authResult.supabase.from('currencies').select('*').order('code');

  if (error) {
    return { isSuccess: false, error: mapSupabaseError(error) };
  }

  return { isSuccess: true, data: data ?? [] };
}
