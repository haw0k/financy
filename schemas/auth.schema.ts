import { z } from 'zod';
import { authConfig } from '@/config';
import { ERole } from '@/enums';
import { AUTH_MSGS } from '@/messages';

export type TLoginInput = { email: string; password: string };
export type TSignUpInput = { email: string; password: string; role: ERole };

export const loginSchema = z.object({
  email: z.email({ message: AUTH_MSGS.INVALID_EMAIL }),
  password: z.string().min(authConfig.minPasswordLength, {
    message: AUTH_MSGS.PASSWORD_TOO_SHORT,
  }),
});

export const signUpSchema = z.object({
  email: z.email({ message: AUTH_MSGS.INVALID_EMAIL }),
  password: z.string().min(authConfig.minPasswordLength, {
    message: AUTH_MSGS.PASSWORD_TOO_SHORT,
  }),
  role: z.enum(ERole).refine((r) => r !== ERole.Admin, {
    message: AUTH_MSGS.INVALID_ROLE,
  }),
});
