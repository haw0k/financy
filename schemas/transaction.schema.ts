import { z } from 'zod';
import { TRANSACTION_MSGS } from '@/messages';

export const transactionSchema = z.object({
  amount: z.number().positive({ error: 'Amount must be positive' }),
  type: z.enum(['income', 'expense'], { error: TRANSACTION_MSGS.INVALID_TYPE }),
  date: z.string().min(1, { error: 'Date is required' }),
  description: z.string().nullable(),
  categoryId: z.string().nullable().optional(),
  receiverId: z.string().optional(),
});

export type TTransactionInput = z.infer<typeof transactionSchema>;
