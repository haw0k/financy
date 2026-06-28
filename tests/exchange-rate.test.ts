import { describe, expect, it, vi } from 'vitest';
import { convertToUsd, getExchangeRate, getExchangeRates } from '@/lib/exchange-rate';
import { ECurrency, EExchangeRateProvider } from '@/enums';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('exchange rate service', () => {
  it('returns empty array when PrivatBank API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const rates = await getExchangeRates(EExchangeRateProvider.PrivatBank);

    expect(rates).toEqual([]);
  });

  it('parses PrivatBank USD and EUR buy rates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { ccy: 'USD', base_ccy: 'UAH', buy: '41.50', sale: '42.00' },
        { ccy: 'EUR', base_ccy: 'UAH', buy: '44.20', sale: '45.00' },
      ],
    });

    const rates = await getExchangeRates(EExchangeRateProvider.PrivatBank);

    expect(rates).toEqual([
      { currency: ECurrency.USD, provider: EExchangeRateProvider.PrivatBank, rate: 41.5 },
      { currency: ECurrency.EUR, provider: EExchangeRateProvider.PrivatBank, rate: 44.2 },
    ]);
  });

  it('parses Monobank USD and EUR buy rates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { currencyCodeA: 840, currencyCodeB: 980, rateBuy: 41.6, rateSell: 42.1 },
        { currencyCodeA: 978, currencyCodeB: 980, rateBuy: 44.3, rateSell: 45.1 },
      ],
    });

    const rates = await getExchangeRates(EExchangeRateProvider.Monobank);

    expect(rates).toEqual([
      { currency: ECurrency.USD, provider: EExchangeRateProvider.Monobank, rate: 41.6 },
      { currency: ECurrency.EUR, provider: EExchangeRateProvider.Monobank, rate: 44.3 },
    ]);
  });

  it('returns 1 for USD exchange rate', async () => {
    mockFetch.mockClear();

    const rate = await getExchangeRate(ECurrency.USD);

    expect(rate).toBe(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns USD-per-unit rate for UAH from selected provider', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { ccy: 'USD', base_ccy: 'UAH', buy: '41.50', sale: '42.00' },
        { ccy: 'EUR', base_ccy: 'UAH', buy: '44.20', sale: '45.00' },
      ],
    });

    const rate = await getExchangeRate(ECurrency.UAH, EExchangeRateProvider.PrivatBank);

    expect(rate).toBeCloseTo(1 / 41.5, 10);
  });

  it('returns USD-per-unit cross-rate for EUR from selected provider', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { ccy: 'USD', base_ccy: 'UAH', buy: '41.50', sale: '42.00' },
        { ccy: 'EUR', base_ccy: 'UAH', buy: '44.20', sale: '45.00' },
      ],
    });

    const rate = await getExchangeRate(ECurrency.EUR, EExchangeRateProvider.PrivatBank);

    expect(rate).toBeCloseTo(44.2 / 41.5, 4);
  });

  it('returns null when USD rate is missing for cross-rate', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ ccy: 'EUR', base_ccy: 'UAH', buy: '44.20', sale: '45.00' }],
    });

    const rate = await getExchangeRate(ECurrency.UAH, EExchangeRateProvider.PrivatBank);

    expect(rate).toBeNull();
  });

  it('returns null when currency rate is missing for cross-rate', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ ccy: 'USD', base_ccy: 'UAH', buy: '41.50', sale: '42.00' }],
    });

    const rate = await getExchangeRate(ECurrency.EUR, EExchangeRateProvider.PrivatBank);

    expect(rate).toBeNull();
  });

  it('converts amount to USD using exchange rate', () => {
    expect(convertToUsd(1000, 1 / 40)).toBe(25);
    expect(convertToUsd(100, 1)).toBe(100);
    expect(convertToUsd(100, 44.2 / 41.5)).toBe(106.51);
  });
});
