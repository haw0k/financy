# Spec for Migrate Auth Forms to Server Actions

branch: refactor/migrate-auth-forms-to-server-actions

## Summary

Replace direct client-side Supabase auth calls in login, sign-up, and admin auth forms with Next.js server actions. The forms currently call `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()` directly from the browser. Moving this logic to server actions improves security posture (auth calls happen server-side, closer to cookie management) and aligns with Next.js best practices.

## Functional Requirements

- Auth forms (Login, SignUp, AdminAuth) must submit credentials via server actions instead of calling Supabase browser client directly
- Server actions must use the server-side Supabase client (`createServerClient` from `@supabase/ssr` with cookies)
- Password matching validation for sign-up must remain (client-side check is acceptable)
- Loading state must be preserved during server action execution
- Error handling must be preserved — server action errors surfaced to the form UI
- Redirect after successful auth must still work (login → dashboard, sign-up → success page)
- Admin auth flow (login vs sign-up detection) must continue to work correctly
- Existing role/status middleware behavior must not be affected

## Possible Edge Cases

- Server action throwing an error that needs to be displayed in the form
- Network timeout or server action failure — loading state should reset
- Admin auth page toggling between login and sign-up modes — both paths need server actions
- Existing `handleSupabaseError` utility may need adaptation for server-returned errors
- Cookie handling differences between server and client context
- Concurrent form submissions (double-click) must be prevented

## Acceptance Criteria

- Login form submits via server action and redirects to dashboard on success
- Sign-up form submits via server action and redirects to sign-up success page on success
- Admin auth page works for both login and sign-up paths via server actions
- Form validation errors (e.g., password mismatch) are shown to the user
- Auth errors (e.g., invalid credentials, email taken) are shown to the user
- Loading state is correctly shown and cleared in all cases (success, error, timeout)
- Existing tests pass or are updated to reflect the new pattern
- No regression in middleware-based route protection

## Open Questions

- Should we use `revalidatePath` or `router.refresh()` after successful auth to ensure middleware re-evaluates session? Use `redirect()`
- Should the `useRole` hook remain client-side or also move to server-side data fetching? Replace `useRole` with `RoleProvider` / `useRoleContext`; role/status are read server-side in `app/layout.tsx` and provided via React context.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Server action returns success and form redirects
- Server action returns error and form displays it
- Form shows loading state during submission
- Password mismatch validation on sign-up
- Admin auth page renders correct form based on admin existence check
