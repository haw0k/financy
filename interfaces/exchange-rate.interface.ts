import { ECurrency, EExchangeRateProvider } from '@/enums';

export interface IExchangeRate {
  currency: ECurrency;
  provider: EExchangeRateProvider;
  rate: number;
}
