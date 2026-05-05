# Spec for Admin Role and Registration Approval

branch: feat/admin-role-registration-approval

## Summary

Add an "admin" role to the system with a dedicated `/admin` page. After signup, users enter a "pending" state and see a message that their registration awaits admin approval. On the admin page, a table lists all pending users with approve/reject actions. Approved users gain access and receive an email notification (or in-app notification if email is unavailable). Rejected users receive a rejection notice.

## Functional Requirements

- Add an `admin` role alongside existing `sender` and `receiver` roles
- After signup, new users are placed in a `pending` approval state and cannot access protected routes
- Pending users see a clear message on the auth page indicating their registration is under review
- Admin role has access to a new `/admin` page
- `/admin` is protected by middleware — only users with the admin role can access it
- The admin page displays a table of all users with pending registration status
- Table columns include: login (email), signup date, and action buttons
- Each pending user row has an **Approve** button and a **Reject** button
- Approving a user changes their status to active and grants them access based on their selected role (sender/receiver)
- Rejecting a user keeps their account inactive; their record remains but they cannot log in
- Admin cannot approve or reject their own account
- Approved users receive an email notification confirming their registration approval
- Rejected users receive an email (or in-app) notification informing them of the rejection
- If a free email service is not feasible, in-app notifications displayed on the auth page after login attempt serve as an alternative
- Table supports an empty state when no pending users exist

## Possible Edge Cases

- Admin tries to approve/reject an already processed user (idempotent or disabled buttons)
- Non-admin user attempts to access `/admin` — redirected to dashboard with an error toast
- Unauthenticated user attempts to access `/admin` — redirected to login
- First admin account must be seeded manually (database seed or direct DB insertion)
- Email delivery failure during approval/rejection — status change still committed, user can see status on next login attempt

## Acceptance Criteria

- [ ] `admin` role exists in the database schema with corresponding RLS policies
- [ ] New signups default to `pending` status and see a "waiting for approval" message
- [ ] Pending users cannot access any protected dashboard routes
- [ ] `/admin` page is accessible only by admin users
- [ ] Admin page shows a table of pending users with login, signup date, approve and reject buttons
- [ ] Approve action changes user status to active; reject action keeps user inactive
- [ ] Admin cannot approve or reject their own pending record
- [ ] Notification is sent (email or in-app) upon approval or rejection
- [ ] Empty state message is shown when no pending users exist

## Open Questions

- Which free email service should be used? (Resend, Brevo, SendGrid free tier?) Resend
- Should approved users have their role (sender/receiver) displayed in the admin table? Yes
- Should rejected users be fully deletable or kept for audit? Fully deletable. We can have "reject & delete" button in the admin's table.
- How is the first admin account created? (Database seed script vs manual insert). On page /auth/admin page. If the admin role has already created, the login page for the admin role is shown. If not, we show a sign-up form for the admin role on page /auth/admin page. Hide the /auth/admin route from robots.

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
