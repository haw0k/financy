import { authConfig } from '@/config';

export const AUTH_MSGS = {
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${authConfig.minPasswordLength} characters`,
  INVALID_ROLE: 'Invalid account type',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  ADMIN_ACCOUNT_EXISTS: 'An admin account already exists',
  REDIRECT_URL_NOT_CONFIGURED: 'Redirect URL is not configured. Please contact support.',
  TIMEOUT: 'Request timed out. Please try again.',
  PENDING_APPROVAL_REQUIRED:
    'Your account is pending approval. Please wait for an admin to approve your registration.',
  ADMIN_ACCESS_DENIED: 'Admin accounts cannot access financial data.',
  ERROR_TITLE: 'Sorry, something went wrong.',
  ERROR_CODE_LABEL: 'Code error',
  ERROR_UNSPECIFIED: 'An unspecified error occurred.',
  ERROR_BACK_TO_LOGIN: 'Back to login',
} as const;
