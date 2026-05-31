import * as z from 'zod';
import { ERole } from '@/enums';
import { authConfig } from '@/config';
import { AUTH_MSGS } from '@/messages';

export type TLoginInput = { email: string; password: string };
export type TSignUpInput = { email: string; password: string; role: ERole };

export const loginSchema = z.object({
  email: z.email(AUTH_MSGS.INVALID_EMAIL),
  password: z.string().min(authConfig.minPasswordLength, { error: AUTH_MSGS.PASSWORD_TOO_SHORT }),
});

export const signUpSchema = z.object({
  email: z.email(AUTH_MSGS.INVALID_EMAIL),
  password: z.string().min(authConfig.minPasswordLength, { error: AUTH_MSGS.PASSWORD_TOO_SHORT }),
  role: z.enum(ERole).refine((r) => r !== ERole.Admin, { error: AUTH_MSGS.INVALID_ROLE }),
});
