import { exchangeRateCacheSeconds } from '@/config';
import { ECurrency, EExchangeRateProvider } from '@/enums';
import { EXCHANGE_RATE_MSGS } from '@/messages';
import type { TExchangeRateProvider } from '@/types';

export interface IExchangeRate {
  currency: ECurrency;
  provider: EExchangeRateProvider;
  rate: number;
}

interface IPrivatBankRate {
  ccy: string;
  base_ccy: string;
  buy: string;
  sale: string;
}

interface IMonobankRate {
  currencyCodeA: number;
  currencyCodeB: number;
  rateBuy: number;
  rateSell: number;
  rateCross?: number;
}

const CURRENCY_CODES: Record<ECurrency, number> = {
  [ECurrency.UAH]: 980,
  [ECurrency.USD]: 840,
  [ECurrency.EUR]: 978,
};

const PRIVATBANK_API_URL = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
const MONOBANK_API_URL = 'https://api.monobank.ua/bank/currency';

export function mapProvider(value: TExchangeRateProvider): EExchangeRateProvider {
  if (value === EExchangeRateProvider.Monobank) {
    return EExchangeRateProvider.Monobank;
  }
  return EExchangeRateProvider.PrivatBank;
}

async function fetchPrivatBankRates(): Promise<IExchangeRate[]> {
  const response = await fetch(PRIVATBANK_API_URL, {
    next: { revalidate: exchangeRateCacheSeconds },
  });

  if (!response.ok) {
    throw new Error(EXCHANGE_RATE_MSGS.PRIVATBANK_FETCH_FAILED);
  }

  const data = (await response.json()) as IPrivatBankRate[];

  return data
    .filter((item) => item.base_ccy === ECurrency.UAH)
    .map((item) => ({
      currency: item.ccy as ECurrency,
      provider: EExchangeRateProvider.PrivatBank,
      rate: Number.parseFloat(item.buy),
    }));
}

async function fetchMonobankRates(): Promise<IExchangeRate[]> {
  const response = await fetch(MONOBANK_API_URL, {
    next: { revalidate: exchangeRateCacheSeconds },
  });

  if (!response.ok) {
    throw new Error(EXCHANGE_RATE_MSGS.MONOBANK_FETCH_FAILED);
  }

  const data = (await response.json()) as IMonobankRate[];

  return data
    .filter(
      (item) =>
        item.currencyCodeB === CURRENCY_CODES.UAH &&
        (item.currencyCodeA === CURRENCY_CODES.USD || item.currencyCodeA === CURRENCY_CODES.EUR)
    )
    .map((item) => {
      const currency = item.currencyCodeA === CURRENCY_CODES.USD ? ECurrency.USD : ECurrency.EUR;
      return {
        currency,
        provider: EExchangeRateProvider.Monobank,
        rate: item.rateBuy,
      };
    });
}

export async function getExchangeRates(
  provider: TExchangeRateProvider = EExchangeRateProvider.PrivatBank
): Promise<IExchangeRate[]> {
  const selectedProvider = mapProvider(provider);

  try {
    if (selectedProvider === EExchangeRateProvider.Monobank) {
      return await fetchMonobankRates();
    }
    return await fetchPrivatBankRates();
  } catch {
    return [];
  }
}

export async function getExchangeRate(
  currency: ECurrency,
  provider: TExchangeRateProvider = EExchangeRateProvider.PrivatBank
): Promise<number | null> {
  if (currency === ECurrency.USD) {
    return 1;
  }

  // The APIs return how many UAH are needed to buy 1 USD/EUR. To get a consistent
  // "USD per 1 unit of transaction currency" rate we divide by the USD/UAH rate.
  const rates = await getExchangeRates(provider);
  const usdRate = rates.find((rate) => rate.currency === ECurrency.USD);

  if (!usdRate) {
    return null;
  }

  if (currency === ECurrency.UAH) {
    return 1 / usdRate.rate;
  }

  const currencyRate = rates.find((rate) => rate.currency === currency);
  if (!currencyRate) {
    return null;
  }

  return Number((currencyRate.rate / usdRate.rate).toFixed(4));
}

/**
 * Returns the inverse rate for display purposes.
 * - For UAH: how many units are needed to buy 1 USD (e.g. 41.50).
 * - For other currencies: the USD-per-unit rate directly (e.g. 1.07 for EUR).
 */
export function getDisplayRate(serverRate: number, currency: ECurrency): number {
  if (currency === ECurrency.UAH) {
    return Number((1 / serverRate).toFixed(4));
  }
  return Number(serverRate.toFixed(4));
}

export function convertToUsd(amount: number, rate: number): number {
  return Number((amount * rate).toFixed(2));
}
