import { ECurrency, EExchangeRateProvider } from '@/enums';
import { EXCHANGE_RATE_MSGS } from '@/messages';

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

// Exchange rates change roughly once per day; cache fetch responses for several hours
// to reduce API calls while still allowing updates when banks publish new rates.
const RATE_CACHE_SECONDS = 4 * 60 * 60;

export function mapProvider(value: string): EExchangeRateProvider {
  if (value === EExchangeRateProvider.Monobank) {
    return EExchangeRateProvider.Monobank;
  }
  return EExchangeRateProvider.PrivatBank;
}

async function fetchPrivatBankRates(): Promise<IExchangeRate[]> {
  const response = await fetch(PRIVATBANK_API_URL, {
    next: { revalidate: RATE_CACHE_SECONDS },
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
    next: { revalidate: RATE_CACHE_SECONDS },
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
  provider: string = EExchangeRateProvider.PrivatBank
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
  provider: string = EExchangeRateProvider.PrivatBank
): Promise<number | null> {
  if (currency === ECurrency.USD) {
    return 1;
  }

  // For UAH transactions we need the USD/UAH buy rate; for EUR transactions we need the EUR/UAH buy rate.
  const rates = await getExchangeRates(provider);
  const targetCode = currency === ECurrency.UAH ? ECurrency.USD : currency;
  const found = rates.find((rate) => rate.currency === targetCode);

  if (!found) {
    return null;
  }

  return found.rate;
}

export function convertToUsd(amount: number, rate: number): number {
  return Number((amount / rate).toFixed(2));
}
