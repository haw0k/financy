import { z } from 'zod';
import { CATEGORY_MSGS } from '@/messages';

export const categorySchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  type: z.enum(['income', 'expense'], { error: CATEGORY_MSGS.INVALID_TYPE }),
  color: z.string().min(1, { error: 'Color is required' }),
  type_id: z.string().optional(),
});

export const categoryTypeSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
});

export type TCategoryInput = z.infer<typeof categorySchema>;
export type TCategoryTypeInput = z.infer<typeof categoryTypeSchema>;
