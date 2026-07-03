import { z } from 'zod';
import { CATEGORY_ICONS } from '@/lib/icons';
import { CATEGORY_MSGS } from '@/messages';

const validIconValues = CATEGORY_ICONS.map((item) => item.value);
const iconSchema = z
  .union([z.enum([validIconValues[0], ...validIconValues.slice(1)]), z.literal('')])
  .optional();

export const categorySchema = z.object({
  name: z.string().min(1, { message: CATEGORY_MSGS.NAME_REQUIRED }),
  type: z.enum(['income', 'expense'], { message: CATEGORY_MSGS.INVALID_TYPE }),
  color: z.string().min(1, { message: CATEGORY_MSGS.COLOR_REQUIRED }),
  type_id: z.string().optional(),
  icon: iconSchema,
});

export const categoryTypeSchema = z.object({
  name: z.string().min(1, { message: CATEGORY_MSGS.NAME_REQUIRED }),
  icon: iconSchema,
});

export type TCategoryInput = z.infer<typeof categorySchema>;
export type TCategoryTypeInput = z.infer<typeof categoryTypeSchema>;
