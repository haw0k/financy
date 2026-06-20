# Plan: refactor: Migrate Auth Forms to Server Actions

## Spec

Link: [Migrate Auth Forms to Server Actions](../_specs/2026-05-25-migrate-auth-forms-to-server-actions.md)

## Context

Auth forms (Login, SignUp, AdminAuth) currently call Supabase browser client directly — `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()` execute in the browser. This is the only mutation logic running client-side; all other data operations use server components or API routes. Moving auth to server actions improves security (session cookies set server-side, closer to cookie management) and aligns with Next.js best practices.

## Current State

- **LoginPage** — calls `supabase.auth.signInWithPassword()` via browser client, redirects with `useRouter().push()`
- **SignUpPage** — calls `supabase.auth.signUp()` via browser client, client-side password match check, redirects with `useRouter().push()`
- **AdminAuthPage** — fetches `/api/auth/check-admin` to detect admin existence, then either `signUp` (with `emailRedirectTo`) or `signInWithPassword`, mixed redirect + inline success message
- **Server client** (`lib/supabase/server.ts`) — already uses `createServerClient` from `@supabase/ssr` with `cookies()`, ready to use in server actions
- **No server actions exist** in the project; `app/actions/` directory does not exist yet
- **`handleSupabaseError`** is used by 7+ components (auth forms + dashboard layouts) — must not be removed or modified

## Design Decisions

1. **Return type**: `{ success: boolean; error?: string }` — auth failures are expected control flow, not exceptions. No need to serialize error objects across server/client boundary.
2. **Redirects**: `redirect()` from `next/navigation` inside server actions. Ensures `Set-Cookie` headers are sent before navigation. Idiomatic Next.js pattern, recommended by Supabase SSR docs.
3. **Client-side state**: `useTransition` + direct async call instead of `useActionState`. Forms use controlled inputs (`useState`), not `FormData`. `useTransition` is a drop-in replacement — `isPending` replaces manual `isLoading`. Server action call is wrapped in `withTimeout()` from `@/lib/with-timeout` (default 15s) to guarantee `isPending` resets even if the server action hangs — the promise rejects, `startTransition` catches it, and `isPending` flips to `false`.
4. **Timeout protection**: `withTimeout(promise, ms)` wraps the server action call via `Promise.race`. If the action doesn't resolve within 15 seconds, the promise rejects with `'Request timed out'`, the form shows the error via `showError`, and loading state resets. Default timeout covers the worst-case Supabase auth latency (~10s for email sending) with buffer.
5. **Error display**: Forms call `showError(title, message)` directly with the error string from the server action. `handleSupabaseError` stays untouched for DB components.
6. **`adminSignUpAction` redirect**: Returns `{ success: true }` without `redirect()` — AdminAuthPage shows inline confirmation message rather than navigating away.

## Implementation Steps

### Phase 1 — Create server actions

- [x] Create `app/actions/auth.ts` with four exported functions:
  - `loginAction({ email, password })` — calls `signInWithPassword`, on success `redirect(routes.dashboard)`, on error returns `{ success: false, error }`
  - `signUpAction({ email, password, role })` — calls `signUp` with `options.data.role`, on success `redirect(routes.signUpSuccess)`, on error returns `{ success: false, error }`
  - `adminLoginAction({ email, password })` — calls `signInWithPassword`, on success `redirect(routes.admin)`, on error returns `{ success: false, error }`
  - `adminSignUpAction({ email, password })` — calls `signUp` with `emailRedirectTo` and `data.role = ERole.Admin`, on error returns `{ success: false, error }`, on success returns `{ success: true }` (no redirect). `emailRedirectTo` is resolved from `getSupabaseRedirectUrl()`; if not configured, it falls back to the request origin built from `headers()` (`x-forwarded-host` / `host` + `x-forwarded-proto`).

All actions use `createClient()` from `@/lib/supabase/server`. Marked with `'use server'` directive.

### Phase 2 — Refactor LoginPage

- [x] Replace `useState(isLoading)` with `useTransition()` → `isPending`, `startTransition`
- [x] Remove `useRouter`, `createClient` (browser), `handleSupabaseError` imports
- [x] Add `loginAction` from `@/app/actions/auth`, `showError` from `@/components/ui/ToastNotification`, `withTimeout` from `@/lib/with-timeout`
- [x] Rewrite `handleLogin`: `e.preventDefault()`, wrap in `startTransition(async () => { ... })`, call `withTimeout(loginAction({ email, password }))`, on error call `showError('Login', result.error)`
- [x] Replace `isLoading` → `isPending` in button text/disabled

### Phase 3 — Refactor SignUpPage

- [x] Same `useTransition` replacement as LoginPage
- [x] Keep client-side password match check (runs before `startTransition`)
- [x] Rewrite `handleSignUp`: password check → `startTransition` → `withTimeout(signUpAction({ email, password, role }))` → error handling via `showError`
- [x] Replace `isLoading` → `isPending` in button text/disabled

### Phase 4 — Refactor AdminAuthPage

- [x] Same `useTransition` replacement
- [x] Keep `isAdminExist` state + `useEffect` with `/api/auth/check-admin` fetch (remains client-side)
- [x] Keep `isSignUpSuccess` state for inline confirmation message
- [x] Rewrite `handleLogin`: `startTransition` → `withTimeout(adminLoginAction({ email, password }))` → error handling
- [x] Rewrite `handleSignUp`: `startTransition` → `withTimeout(adminSignUpAction({ email, password }))` → on success set `isSignUpSuccess = true`, on error show toast
- [x] Replace `isLoading` → `isPending`
- [x] Remove `getSupabaseRedirectUrl` import (now used server-side only)

### Phase 5 — Tests

- [x] Create `tests/auth-server-actions.test.tsx`
- [x] Server action unit tests: mock `@/lib/supabase/server` → verify correct params passed, error path returns `{ success: false, error }`, success path calls `redirect()` or returns `{ success: true }`
- [x] Form component tests: LoginPage shows error on failure, SignUpPage validates password mismatch without calling server action, AdminAuthPage renders correct form based on admin existence

### Phase 6 — Code Review Follow-up

- [x] Close authorization gap in data Server Actions by adding `requireApprovedUser` to `categories.ts`, `transactions.ts`, and `dashboard.ts`
- [x] Ensure `requireApprovedUser` rejects admin users from financial data actions
- [x] Remove dead admin API routes `app/api/admin/pending-users/*`
- [x] Align `scripts/002_add_role_to_jwt_metadata.sql` with `001_init_database.sql`: admin profile starts as `pending` and is approved on email confirmation
- [x] Harden `approveUserAction` / `rejectUserAction` with target UUID, role, and status validation
- [x] Map service-role client errors through `mapSupabaseError` in admin actions
- [x] Surface `statsError` in `DashboardOverview` with a visible warning
- [x] Remove admin navigation to financial pages (`/admin/categories`, `/admin/dashboard`, `/admin/settings`)
- [x] Fix `AdminAuthPage` error state when `/api/auth/check-admin` fails (show retry instead of defaulting to login)
- [x] Fix small issues: stale comment, empty eslint-disable, optimistic `category_id` update, `setState-in-effect` rule violations, JWT warnings

### Phase 7 — Tests

- [x] Create `tests/auth-server-actions.test.tsx`
- [x] Create `tests/admin-server-actions.test.tsx`
- [x] Update `tests/data-server-actions.test.tsx` for `requireApprovedUser`
- [x] Update `tests/admin-role-registration.test.tsx` for new admin action mocks
- [x] Run `pnpm test:run` — all tests pass

### Phase 8 — Verification

- [ ] Run `pnpm lint && pnpm type-check && pnpm format:check && pnpm test:run && pnpm build` — no errors
- [ ] Manual smoke test: login success/error, signup success/password mismatch/duplicate email, admin login/signup

## Files Summary

| Action    | File                                                                                                                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE    | `app/actions/auth.ts`                                                                                                                                                                                 |
| CREATE    | `app/actions/admin.ts`                                                                                                                                                                                |
| CREATE    | `lib/with-timeout.ts`                                                                                                                                                                                 |
| CREATE    | `schemas/auth.schema.ts`                                                                                                                                                                              |
| CREATE    | `schemas/index.ts`                                                                                                                                                                                    |
| CREATE    | `messages/auth.msg.ts`                                                                                                                                                                                |
| CREATE    | `messages/admin.msg.ts`                                                                                                                                                                               |
| CREATE    | `messages/category.msg.ts`                                                                                                                                                                            |
| CREATE    | `messages/transaction.msg.ts`                                                                                                                                                                         |
| CREATE    | `messages/index.ts`                                                                                                                                                                                   |
| CREATE    | `types/auth-result.type.ts`                                                                                                                                                                           |
| CREATE    | `types/index.ts`                                                                                                                                                                                      |
| CREATE    | `config/auth.config.ts`                                                                                                                                                                               |
| CREATE    | `tests/auth-server-actions.test.tsx`                                                                                                                                                                  |
| CREATE    | `tests/admin-server-actions.test.tsx`                                                                                                                                                                 |
| MODIFY    | `lib/require-auth.ts`                                                                                                                                                                                 |
| MODIFY    | `app/actions/categories.ts`                                                                                                                                                                           |
| MODIFY    | `app/actions/transactions.ts`                                                                                                                                                                         |
| MODIFY    | `app/actions/dashboard.ts`                                                                                                                                                                            |
| MODIFY    | `components/pages/dashboard/DashboardPage.tsx`                                                                                                                                                        |
| MODIFY    | `components/layouts/DashboardOverview.tsx`                                                                                                                                                            |
| MODIFY    | `components/pages/admin/AdminPage.tsx`                                                                                                                                                                |
| MODIFY    | `components/pages/auth/AdminAuthPage.tsx`                                                                                                                                                             |
| MODIFY    | `components/ui/ThemeSelect.tsx`                                                                                                                                                                       |
| MODIFY    | `components/layouts/TransactionsTableClient.tsx`                                                                                                                                                      |
| MODIFY    | `components/layouts/AppShell.tsx`                                                                                                                                                                     |
| MODIFY    | `config/index.ts`                                                                                                                                                                                     |
| MODIFY    | `config/routes.config.ts`                                                                                                                                                                             |
| MODIFY    | `config/navigation.config.ts`                                                                                                                                                                         |
| MODIFY    | `app/layout.tsx`                                                                                                                                                                                      |
| MODIFY    | `app/(app)/admin/page.tsx`                                                                                                                                                                            |
| DELETE    | `app/api/admin/pending-users/*`                                                                                                                                                                       |
| DELETE    | `app/(app)/admin/categories/page.tsx`                                                                                                                                                                 |
| DELETE    | `app/(app)/admin/dashboard/page.tsx`                                                                                                                                                                  |
| DELETE    | `app/(app)/admin/settings/page.tsx`                                                                                                                                                                   |
| NO CHANGE | `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/handle-supabase-error.ts`, `lib/supabase/middleware.ts`, `proxy.ts`, `config/env.config.ts`, `config/site.config.ts`, `components/layouts/*` |

## Risks & Notes

- `redirect()` throws `NEXT_REDIRECT` internally — server action `try/catch` must not intercept it. The `redirect()` call is placed in the success path, outside any error handling, so this is safe.
- `adminSignUpAction` cannot use `window.location.origin` fallback for `emailRedirectTo` — resolves `emailRedirectTo` from `getSupabaseRedirectUrl()` first, and falls back to the request origin built from `headers()` when no env var is configured.
- `useTransition` with async functions is supported in React 19.2.5. `isPending` prevents double submission identically to manual `isLoading`. The timeout wrapper guarantees `isPending` resets even if the server action never resolves — without it, a hung action would leave the form permanently disabled.
- **TODO**: Auth server actions have no rate limiting (see `docs/TODO.md`) — intentionally out of scope per user instruction.

## Definition of Done

- [x] Login form submits via server action, redirects to dashboard on success
- [x] Sign-up form submits via server action, redirects to success page on success
- [x] Admin auth page works for both login (redirect to /admin) and sign-up (inline success message)
- [x] Password mismatch on sign-up shows error without calling server action
- [x] Auth errors (invalid credentials, email taken) shown as toast notifications
- [x] Loading state correctly shown and cleared in all cases
- [x] Data Server Actions reject pending users and admin users at the action boundary
- [x] Admin actions validate target user before approve/reject
- [x] Admin sign-up fails early when redirect URL is not configured
- [x] Admin action errors from the service-role client are sanitized
- [x] `pnpm test:run` passes
- [ ] `pnpm lint && pnpm type-check && pnpm format:check && pnpm build` passes
