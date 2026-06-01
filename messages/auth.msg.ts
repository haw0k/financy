import { authConfig } from '@/config';

export const AUTH_MSGS = {
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${authConfig.minPasswordLength} characters`,
  INVALID_ROLE: 'Invalid account type',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  NOT_AUTHENTICATED: 'Not authenticated',
  ADMIN_ACCOUNT_EXISTS: 'An admin account already exists',
} as const;
