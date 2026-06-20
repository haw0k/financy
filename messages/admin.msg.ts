export const ADMIN_MSGS = {
  FORBIDDEN: 'Forbidden',
  USER_ID_REQUIRED: 'userId is required',
  INVALID_USER_ID: 'Invalid user id',
  CANNOT_APPROVE_SELF: 'Cannot approve your own account',
  CANNOT_REJECT_SELF: 'Cannot reject your own account',
  USER_NOT_PENDING: 'User is not pending approval',
  CANNOT_MANAGE_ADMIN: 'Cannot manage another admin account',
  APPROVE_STATUS_FAILED:
    'Email confirmed, but failed to update profile status. Please retry approval.',
} as const;
