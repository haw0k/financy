# Plan: feat: Environment-Aware Supabase Redirect URL

## Spec

Link: [Environment-Aware Supabase Redirect URL](_specs/2026-05-05-env-aware-supabase-redirect-url.md)

## Current State

- `config/env.config.ts` exports only `devSupabaseRedirectUrl` from `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` exists in `.env.example` but is not consumed anywhere in code
- Only `SignUpPage.tsx` uses `env.devSupabaseRedirectUrl` for the `emailRedirectTo` option
- Login page and OAuth flows do not pass an explicit redirect URL
- No environment-aware selection logic exists — dev override is used unconditionally where referenced

## Implementation Steps

### Phase 1 — Extend environment config

- [ ] Add `supabaseRedirectUrl` to `config/env.config.ts` for `NEXT_PUBLIC_SUPABASE_REDIRECT_URL`
- [ ] Add a `getSupabaseRedirectUrl()` helper (in `config/env.config.ts` or a new utility) that selects the URL based on `process.env.NODE_ENV === 'development'` and nullish check on `supabaseRedirectUrl`

### Phase 2 — Apply to auth flows

- [ ] Update `SignUpPage.tsx` to use `getSupabaseRedirectUrl()` instead of directly referencing `env.devSupabaseRedirectUrl`
- [ ] Audit Login page and OAuth sign-in flows — apply redirect URL via `emailRedirectTo` option where applicable

### Phase 3 — Documentation and cleanup

- [ ] Verify `.env.example` comments clearly explain the difference between dev and prod redirect URL vars
- [ ] Run `pnpm lint && pnpm build` to confirm no regressions

## Risks & Notes

- The selection logic runs client-side, so `process.env.NODE_ENV` must be evaluated at the call site inside the browser (Next.js replaces it at build time). A helper function that bakes this into a configuration value works correctly under Next.js's static replacement.
- The middleware (`lib/supabase/middleware.ts`) does not pass redirect URLs to Supabase — no changes needed there.

## Definition of Done

- [ ] Dev environment continues to use `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- [ ] Production uses `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` when provided, falls back to default otherwise
- [ ] `pnpm lint && pnpm build` passes
- [ ] Auth flows (signup, login, callback) work correctly in dev
