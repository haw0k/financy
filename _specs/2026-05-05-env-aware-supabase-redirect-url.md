# Spec for Environment-Aware Supabase Redirect URL

branch: feat/env-aware-supabase-redirect-url

## Summary

Replace the current development-only redirect URL approach with environment-aware logic. In development, use `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`. In production, use `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` when provided, falling back to the default behavior. The selection is based on `process.env.NODE_ENV === 'development'` and a nullish check on `NEXT_PUBLIC_SUPABASE_REDIRECT_URL`.

## Functional Requirements

- Auth redirect URL selection is environment-aware
- In development (`NODE_ENV === 'development'`): use `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- In production: use `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` when it has a non-nullish value; otherwise fall back to the default Supabase redirect behavior
- Logic applies to all auth operations that use a redirect URL (login, signup, OAuth callback, password reset, email confirmation)
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` is documented in `.env.example` as an optional production override

## Possible Edge Cases

- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` is empty or undefined in production — fall back gracefully to default Supabase behavior
- Both env vars are missing — app should not crash, fall back to default behavior
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` is accidentally set in development — `NODE_ENV` check ensures it is ignored, development var takes priority
- User provides an invalid URL — Supabase rejects it at runtime, no client-side validation needed

## Acceptance Criteria

- [ ] Development environment uses `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` for auth redirects
- [ ] Production environment uses `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` when provided
- [ ] Production falls back to default behavior when `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` is nullish
- [ ] Environment check uses `process.env.NODE_ENV === 'development'` as the branching condition
- [ ] `.env.example` includes both `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` and `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` with comments
- [ ] Existing auth flows (login, signup, callback) continue to work without changes

## Open Questions

- Should there be validation/logging when a redirect URL is misconfigured? Yes.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Redirect URL selection picks dev URL when NODE_ENV is development
- Redirect URL selection picks production URL when NODE_ENV is production and the var is set
- Redirect URL selection falls back to default when production var is nullish
- Fallback when both vars are missing
