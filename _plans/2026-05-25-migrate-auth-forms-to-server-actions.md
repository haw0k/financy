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

- [ ] Create `app/actions/auth.ts` with four exported functions:
  - `loginAction({ email, password })` — calls `signInWithPassword`, on success `redirect(routes.dashboard)`, on error returns `{ success: false, error }`
  - `signUpAction({ email, password, role })` — calls `signUp` with `options.data.role`, on success `redirect(routes.signUpSuccess)`, on error returns `{ success: false, error }`
  - `adminLoginAction({ email, password })` — calls `signInWithPassword`, on success `redirect(routes.admin)`, on error returns `{ success: false, error }`
  - `adminSignUpAction({ email, password })` — calls `signUp` with `emailRedirectTo` (using `getSupabaseRedirectUrl()`) and `data.role = ERole.Admin`, on error returns `{ success: false, error }`, on success returns `{ success: true }` (no redirect)

All actions use `createClient()` from `@/lib/supabase/server`. Marked with `'use server'` directive.

### Phase 2 — Refactor LoginPage

- [ ] Replace `useState(isLoading)` with `useTransition()` → `isPending`, `startTransition`
- [ ] Remove `useRouter`, `createClient` (browser), `handleSupabaseError` imports
- [ ] Add `loginAction` from `@/app/actions/auth`, `showError` from `@/components/ui/ToastNotification`, `withTimeout` from `@/lib/with-timeout`
- [ ] Rewrite `handleLogin`: `e.preventDefault()`, wrap in `startTransition(async () => { ... })`, call `withTimeout(loginAction({ email, password }))`, on error call `showError('Login', result.error)`
- [ ] Replace `isLoading` → `isPending` in button text/disabled

### Phase 3 — Refactor SignUpPage

- [ ] Same `useTransition` replacement as LoginPage
- [ ] Keep client-side password match check (runs before `startTransition`)
- [ ] Rewrite `handleSignUp`: password check → `startTransition` → `withTimeout(signUpAction({ email, password, role }))` → error handling via `showError`
- [ ] Replace `isLoading` → `isPending` in button text/disabled

### Phase 4 — Refactor AdminAuthPage

- [ ] Same `useTransition` replacement
- [ ] Keep `isAdminExist` state + `useEffect` with `/api/auth/check-admin` fetch (remains client-side)
- [ ] Keep `isSignUpSuccess` state for inline confirmation message
- [ ] Rewrite `handleLogin`: `startTransition` → `withTimeout(adminLoginAction({ email, password }))` → error handling
- [ ] Rewrite `handleSignUp`: `startTransition` → `withTimeout(adminSignUpAction({ email, password }))` → on success set `isSignUpSuccess = true`, on error show toast
- [ ] Replace `isLoading` → `isPending`
- [ ] Remove `getSupabaseRedirectUrl` import (now used server-side only)

### Phase 5 — Tests

- [ ] Create `tests/auth-server-actions.test.tsx`
- [ ] Server action unit tests: mock `@/lib/supabase/server` → verify correct params passed, error path returns `{ success: false, error }`, success path calls `redirect()` or returns `{ success: true }`
- [ ] Form component tests: LoginPage shows error on failure, SignUpPage validates password mismatch without calling server action, AdminAuthPage renders correct form based on admin existence

### Phase 6 — Verification

- [ ] Run `pnpm test:run` — existing tests pass, new tests pass
- [ ] Run `pnpm lint && pnpm type-check && pnpm build` — no errors
- [ ] Manual smoke test: login success/error, signup success/password mismatch/duplicate email, admin login/signup

## Files Summary

| Action | File |
|--------|------|
| CREATE | `app/actions/auth.ts` |
| CREATE | `lib/with-timeout.ts` |
| MODIFY | `components/pages/auth/LoginPage.tsx` |
| MODIFY | `components/pages/auth/SignUpPage.tsx` |
| MODIFY | `components/pages/auth/AdminAuthPage.tsx` |
| CREATE | `tests/auth-server-actions.test.tsx` |
| NO CHANGE | `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/handle-supabase-error.ts`, `lib/supabase/middleware.ts`, `proxy.ts`, `config/`, `components/layouts/*` |

## Risks & Notes

- `redirect()` throws `NEXT_REDIRECT` internally — server action `try/catch` must not intercept it. The `redirect()` call is placed in the success path, outside any error handling, so this is safe.
- `adminSignUpAction` cannot use `window.location.origin` fallback for `emailRedirectTo` — uses `getSupabaseRedirectUrl()` only. If neither env var is set, Supabase uses its configured default redirect URL.
- `useTransition` with async functions is supported in React 19.2.5. `isPending` prevents double submission identically to manual `isLoading`. The timeout wrapper guarantees `isPending` resets even if the server action never resolves — without it, a hung action would leave the form permanently disabled.

## Definition of Done

- [ ] Login form submits via server action, redirects to dashboard on success
- [ ] Sign-up form submits via server action, redirects to success page on success
- [ ] Admin auth page works for both login (redirect to /admin) and sign-up (inline success message)
- [ ] Password mismatch on sign-up shows error without calling server action
- [ ] Auth errors (invalid credentials, email taken) shown as toast notifications
- [ ] Loading state correctly shown and cleared in all cases
- [ ] `pnpm test:run` passes
- [ ] `pnpm lint && pnpm type-check && pnpm build` passes
