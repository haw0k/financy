import { z } from 'zod';
import { EExchangeRateProvider } from '@/enums';
import { TRANSACTION_MSGS } from '@/messages';

export const transactionSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be positive' }),
  currencyId: z.string().uuid({ message: 'Currency is required' }),
  exchangeRate: z.number().positive({ message: 'Exchange rate must be positive' }),
  amountUsd: z.number().positive({ message: 'USD amount must be positive' }),
  type: z.enum(['income', 'expense'], { message: TRANSACTION_MSGS.INVALID_TYPE }),
  date: z.iso.date({ message: 'Invalid date format' }),
  description: z.string().nullable(),
  categoryId: z.string().nullable().optional(),
  receiverId: z.string().optional(),
  rateProvider: z.enum([EExchangeRateProvider.PrivatBank, EExchangeRateProvider.Monobank], {
    message: 'Exchange rate provider is required',
  }),
});

export type TTransactionInput = z.infer<typeof transactionSchema>;
