import { z } from 'zod';
import { TRANSACTION_MSGS } from '@/messages';

export const transactionSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be positive' }),
  type: z.enum(['income', 'expense'], { message: TRANSACTION_MSGS.INVALID_TYPE }),
  date: z.iso.date({ message: 'Invalid date format' }),
  description: z.string().nullable(),
  categoryId: z.string().nullable().optional(),
  receiverId: z.string().optional(),
});

export type TTransactionInput = z.infer<typeof transactionSchema>;
