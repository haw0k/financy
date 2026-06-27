'use server';

import { cacheTag, cacheLife as nextCacheLife } from 'next/cache';
import { requireApprovedUser } from '@/lib/require-auth';
import { CACHE_TAGS, dashboardCacheLife } from '@/config';
import { EExchangeRateProvider, ECurrency } from '@/enums';
import { EXCHANGE_RATE_MSGS } from '@/messages';
import { getExchangeRate, getExchangeRates } from '@/lib/exchange-rate';
import type { IExchangeRate } from '@/lib/exchange-rate';
import type { TActionResult } from '@/types';

export async function getExchangeRatesAction(
  provider: string = EExchangeRateProvider.PrivatBank
): Promise<TActionResult<IExchangeRate[]>> {
  'use cache: private';
  cacheTag(CACHE_TAGS.exchangeRates);
  nextCacheLife(dashboardCacheLife);

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const rates = await getExchangeRates(provider);

  if (!rates.length) {
    return { isSuccess: false, error: EXCHANGE_RATE_MSGS.RATE_NOT_FOUND };
  }

  return { isSuccess: true, data: rates };
}

export async function getExchangeRateAction(
  currency: ECurrency,
  provider: string = EExchangeRateProvider.PrivatBank
): Promise<TActionResult<number>> {
  'use cache: private';
  cacheTag(CACHE_TAGS.exchangeRates);
  nextCacheLife(dashboardCacheLife);

  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const rate = await getExchangeRate(currency, provider);

  if (rate === null) {
    return { isSuccess: false, error: EXCHANGE_RATE_MSGS.RATE_NOT_FOUND };
  }

  return { isSuccess: true, data: rate };
}
