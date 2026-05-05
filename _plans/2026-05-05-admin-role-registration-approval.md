# Plan: feat: Admin Role and Registration Approval

## Spec

Link: [Admin Role and Registration Approval](_specs/2026-05-05-admin-role-registration-approval.md)

## Current State

- `profiles` table: id, email, role ('sender'/'receiver'), no status/approval field
- RLS: users can only SELECT/INSERT/UPDATE their own profile
- Signup sends `emailRedirectTo` (Supabase confirmation email on signup)
- Middleware only redirects unauthenticated users from `/dashboard` to login
- No service_role key, no admin client, no admin routes or pages
- No `enums/` directory, no `robots.ts` file

## Design Decisions

- **Status column**: separate from role — `profiles.status` (`ProfileStatus.Pending` | `ProfileStatus.Approved`). Role stays as `Role.Sender`/`Role.Receiver`/`Role.Admin`
- **User emails**: signup WITHOUT `emailRedirectTo` — no email on signup. Admin approve calls `adminClient.auth.admin.updateUserById(userId, { email_confirm: true })` which triggers Supabase's built-in confirmation email. User clicks → email confirmed → can access dashboard
- **Admin notification**: none — admin checks the `/admin` page manually. No external email service needed. The only emails are Supabase's built-in confirmation emails
- **Admin signup**: `handle_new_user()` trigger auto-sets `status = ProfileStatus.Approved` when `role = Role.Admin`. Admin also gets Supabase confirmation email via `emailRedirectTo`
- **First admin**: `/auth/admin` shows signup form only when no approved admin exists. Trigger auto-approves
- **Reject**: `admin.deleteUser()` — cascade deletes profile row

## Implementation Steps

### Phase 1 — Database migration

- [ ] Modify `scripts/001_init_database.sql`:
  - Alter `profiles.role` check constraint: add `'admin'`
  - Add `profiles.status text not null default 'pending'` with check `status in ('pending', 'approved')`
  - Add RLS policies: `profiles_select_admin`, `profiles_update_admin` (admin sees/updates all profiles)
  - Add `handle_new_user()` trigger function (currently missing from script): auto-creates profile on `auth.users` insert with `status = case when role = 'admin' then 'approved' else 'pending' end`
- [ ] Recreate database from updated script

### Phase 2 — Config and env

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` and `.env.local`
- [ ] Add `supabaseServiceRoleKey` to `config/env.config.ts`
- [ ] Add `admin: '/admin'`, `adminAuth: '/auth/admin'`, `pending: '/auth/pending'` to `config/routes.config.ts`

### Phase 3 — Enums

- [ ] Create `enums/role.enum.ts`: `enum Role { Sender = 'sender', Receiver = 'receiver', Admin = 'admin' }`
- [ ] Create `enums/profile-status.enum.ts`: `enum ProfileStatus { Pending = 'pending', Approved = 'approved' }`
- [ ] Create `enums/index.ts`: barrel export re-exporting `Role` and `ProfileStatus`
- [ ] Update `components/pages/auth/SignUpPage.tsx`: replace `'sender' | 'receiver'` union with `Role` enum, replace hardcoded `'sender'` default and `'receiver'` cast
- [ ] Update all new code in subsequent phases to use `Role` and `ProfileStatus` enums instead of string literals

### Phase 4 — useRole hook

- [ ] Create `hooks/useRole.ts`: client-side hook that fetches current user's profile from Supabase
  - Returns `{ role: Role, status: ProfileStatus, isLoading, error, refetch }`
  - Uses browser client (`createClient()` from `@/lib/supabase/client`)
  - Gets current user via `supabase.auth.getUser()`, then queries `profiles` table
  - Update `hooks/index.ts` to re-export `useRole`

### Phase 5 — Admin client

- [ ] Create `lib/supabase/admin.ts` with `createAdminClient()` using `@supabase/supabase-js` + service_role key

### Phase 6 — API routes

- [ ] Create `app/api/admin/pending-users/route.ts` (GET): auth check → verify admin role & status is Approved → query profiles where `status = ProfileStatus.Pending AND role != Role.Admin` → return JSON array
- [ ] Create `app/api/admin/pending-users/approve/route.ts` (POST): auth + admin check → validate userId → prevent self-approve → `adminClient.auth.admin.updateUserById(userId, { email_confirm: true })` (Supabase sends built-in confirmation email) → `profiles.update({ status: ProfileStatus.Approved })`
- [ ] Create `app/api/admin/pending-users/reject/route.ts` (POST): auth + admin check → validate userId → prevent self-reject → `adminClient.auth.admin.deleteUser(userId)`
- [ ] Create `app/api/auth/check-admin/route.ts` (GET): uses `createAdminClient()` (service_role, bypasses RLS) → query `profiles` for `role = Role.Admin AND status = ProfileStatus.Approved` → return `{ exists: boolean }`

### Phase 7 — Pending page

- [ ] Create `components/pages/auth/PendingPage.tsx`: client component, uses `useRole()` hook
  - `role === Role.Admin` → "Check your email to confirm your admin account", logout button
  - other roles → "Your account is pending admin approval. You will receive a confirmation email once approved.", logout button
- [ ] Create `app/auth/pending/page.tsx`: metadata + re-export PendingPage

### Phase 8 — Admin auth page

- [ ] Create `components/pages/auth/AdminAuthPage.tsx`: client component, checks `GET /api/auth/check-admin`
  - No approved admin exists → signup form (email, password, submit with `emailRedirectTo`, role = `Role.Admin`). After successful signUp: show inline success state "Check your email to confirm your admin account" (do NOT redirect to signup-success page)
  - Approved admin exists → login form. After successful login: redirect according to middleware (admin goes to `/admin`)
- [ ] Create `app/auth/admin/page.tsx`: metadata + re-export AdminAuthPage

### Phase 9 — Admin dashboard page

- [ ] Create `components/pages/admin/AdminPage.tsx`: client component, uses `useRole()` for client-side admin verification
  - Fetches `GET /api/admin/pending-users`
  - Empty state: `Empty` component with "No pending registrations"
  - Table: `Table` with columns Email, Signup Date, Role (Badge), Actions (Approve + Reject buttons)
  - Per-row loading state, toast on success/error, row removal on action
- [ ] Create `components/pages/admin/index.ts`: barrel export
- [ ] Create `app/admin/page.tsx`: metadata + re-export AdminPage
- [ ] Create `app/admin/layout.tsx`: server-side admin role + status check (defense-in-depth)

### Phase 10 — Middleware updates

- [ ] Update `proxy.ts` matcher to include `'/admin/:path*'`
- [ ] Update `lib/supabase/middleware.ts`:
  - Check A: `/admin` paths — if no user → login; if email not confirmed → `/auth/pending`; if role != Role.Admin or status != ProfileStatus.Approved → dashboard
  - Check B: `/dashboard` paths — if user exists and email is NOT confirmed → redirect to `/auth/pending` ("awaiting admin approval")

### Phase 11 — Existing file updates

- [ ] `SignUpPage.tsx`: REMOVE `emailRedirectTo` from signUp options (no email on signup — admin sends it on approve). After signup, redirect to signup-success
- [ ] Update `SignUpSuccessPage.tsx`: "Registration Submitted — awaiting admin approval. You will receive a confirmation email once approved."
- [ ] `DashboardNav.tsx`: add admin link (`routes.admin`) conditionally via `useRole()` (show when `role === Role.Admin && status === ProfileStatus.Approved`)

### Phase 12 — Supporting files

- [ ] Create `app/robots.ts`: disallow `/auth/admin`

### Phase 13 — Tests

- [ ] Create `tests/admin-role-registration.test.tsx`: middleware redirects, page rendering, approve/reject actions, empty state

## Critical Files

| Action | Path                                           |
| ------ | ---------------------------------------------- |
| Modify | `scripts/001_init_database.sql`                |
| Create | `enums/role.enum.ts`                           |
| Create | `enums/profile-status.enum.ts`                 |
| Create | `enums/index.ts`                               |
| Create | `lib/supabase/admin.ts`                        |
| Create | `app/api/admin/pending-users/route.ts`         |
| Create | `app/api/admin/pending-users/approve/route.ts` |
| Create | `app/api/admin/pending-users/reject/route.ts`  |
| Create | `app/api/auth/check-admin/route.ts`            |
| Create | `hooks/useRole.ts`                             |
| Create | `components/pages/auth/PendingPage.tsx`        |
| Create | `app/auth/pending/page.tsx`                    |
| Create | `components/pages/auth/AdminAuthPage.tsx`      |
| Create | `app/auth/admin/page.tsx`                      |
| Create | `components/pages/admin/AdminPage.tsx`         |
| Create | `components/pages/admin/index.ts`              |
| Create | `app/admin/page.tsx`                           |
| Create | `app/admin/layout.tsx`                         |
| Create | `app/robots.ts`                                |
| Modify | `hooks/index.ts`                               |
| Modify | `proxy.ts`                                     |
| Modify | `lib/supabase/middleware.ts`                   |
| Modify | `config/env.config.ts`                         |
| Modify | `config/routes.config.ts`                      |
| Modify | `.env.example`                                 |
| Modify | `components/pages/auth/SignUpPage.tsx`         |
| Modify | `components/pages/auth/SignUpSuccessPage.tsx`  |

## Verification

1. `pnpm lint && pnpm build` passes
2. **Admin setup E2E**: open `/auth/admin` → no admin → signup form → submit → receive Supabase confirmation email → click link → admin can access `/admin`
3. **Regular user E2E**: signup as sender → see "awaiting admin approval" message → no email received → login → middleware redirects to `/auth/pending` → admin approves → user receives Supabase confirmation email → clicks link → can access dashboard
4. **Reject flow**: register user → admin rejects → user deleted, can't login
5. **Self-protection**: admin can't see/approve/reject own account in table
