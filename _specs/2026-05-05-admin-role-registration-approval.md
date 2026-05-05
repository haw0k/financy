# Spec for Admin Role and Registration Approval

branch: feat/admin-role-registration-approval

## Summary

Add an "admin" role to the system with a dedicated `/admin` page. After signup, users enter a "pending" state and see a message that their registration awaits admin approval. On the admin page, a table lists all pending users with approve/reject actions. Approved users are confirmed via Supabase Auth Admin API, which triggers Supabase's built-in email notification. Rejected users are deleted.

## Functional Requirements

- Add an `admin` role alongside existing `sender` and `receiver` roles
- After signup, new users are placed in a `pending` approval state and cannot access protected routes
- Pending users see a clear message on the auth page indicating their registration is under review
- Admin role has access to a new `/admin` page
- `/admin` is protected by middleware — only users with the admin role can access it
- The admin page displays a table of all users with pending registration status
- Table columns include: login (email), signup date, and action buttons
- Each pending user row has an **Approve** button and a **Reject** button
- Approving a user confirms their Supabase Auth account via `admin.confirmUser()`, which automatically sends Supabase's built-in confirmation email
- Rejecting a user deletes them via `admin.deleteUser()`
- Admin cannot approve or reject their own account
- No external email service required — Supabase Auth built-in emails handle notifications
- Table supports an empty state when no pending users exist

## Possible Edge Cases

- Admin tries to approve/reject an already processed user (idempotent or disabled buttons)
- Non-admin user attempts to access `/admin` — redirected to dashboard with an error toast
- Unauthenticated user attempts to access `/admin` — redirected to login
- First admin account must be seeded manually (database seed or direct DB insertion)
- Supabase Admin API errors during confirm/delete — show error toast and do not change local UI state

## Acceptance Criteria

- [ ] `admin` role exists in the database schema with corresponding RLS policies
- [ ] New signups default to `pending` status and see a "waiting for approval" message
- [ ] Pending users cannot access any protected dashboard routes
- [ ] `/admin` page is accessible only by admin users
- [ ] Admin page shows a table of pending users with login, signup date, approve and reject buttons
- [ ] Approve action confirms user via Supabase Admin API; reject action deletes user
- [ ] Admin cannot approve or reject their own pending record
- [ ] Supabase Auth sends built-in confirmation email on approve
- [ ] Empty state message is shown when no pending users exist

## Open Questions

- Email notifications: use Supabase Auth built-in emails via `admin.confirmUser()` — no external service needed
- Should approved users have their role (sender/receiver) displayed in the admin table? Yes
- Rejected users are deleted via `admin.deleteUser()`
- How is the first admin account created? On page `/auth/admin`. If an admin already exists, show admin login form. If not, show admin sign-up form. Hide `/auth/admin` from robots via `robots.ts`.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Admin middleware redirects non-admin users away from `/admin`
- Admin middleware redirects unauthenticated users to login
- Admin page renders pending users in a table
- Admin page shows empty state when no pending users
- Approve action updates user status correctly
- Reject action updates user status correctly
- Admin cannot approve/reject their own account
- Pending user cannot access dashboard routes
- Signup completion shows "waiting for approval" message
