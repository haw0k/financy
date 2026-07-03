import { z } from 'zod';
import { CATEGORY_MSGS } from '@/messages';

export const categorySchema = z.object({
  name: z.string().min(1, { message: CATEGORY_MSGS.NAME_REQUIRED }),
  type: z.enum(['income', 'expense'], { message: CATEGORY_MSGS.INVALID_TYPE }),
  color: z.string().min(1, { message: CATEGORY_MSGS.COLOR_REQUIRED }),
  type_id: z.string().optional(),
  icon: z.string().optional(),
});

export const categoryTypeSchema = z.object({
  name: z.string().min(1, { message: CATEGORY_MSGS.NAME_REQUIRED }),
  icon: z.string().optional(),
});

export type TCategoryInput = z.infer<typeof categorySchema>;
export type TCategoryTypeInput = z.infer<typeof categoryTypeSchema>;
