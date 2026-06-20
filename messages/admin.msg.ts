export const ADMIN_MSGS = {
  FORBIDDEN: 'Forbidden',
  USER_ID_REQUIRED: 'userId is required',
  CANNOT_APPROVE_SELF: 'Cannot approve your own account',
  CANNOT_REJECT_SELF: 'Cannot reject your own account',
  APPROVE_STATUS_FAILED:
    'Email confirmed, but failed to update profile status. Please retry approval.',
} as const;
