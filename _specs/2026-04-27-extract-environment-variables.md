# Spec for Extract Environment Variables

branch: refactor/extract-environment-variables

## Summary

Extract all `process.env.*` references scattered across the codebase into a single `config/env.config.ts` file with a typed `env` object. This centralizes environment variable access, provides type safety, and makes it easy to see all required env vars at a glance.

## Functional Requirements

- Create `config/env.config.ts` with a `const env = { ... }` object containing all environment variables used in the application
- Re-export from `config/index.ts`
- Replace all direct `process.env.*` references throughout the codebase with imports from the new config
- Cover all env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`, and `NODE_ENV`

## Possible Edge Cases

- `NODE_ENV` is a special Next.js compile-time constant — it must remain as-is or be treated carefully to avoid breaking production optimizations
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is optional (used with `??` fallback) — the env config should handle optional vars without `!` assertion
- The Supabase client files create new clients per request — they need to read values at runtime, not at import time

## Acceptance Criteria

- `config/env.config.ts` exists with a typed `env` object
- `config/index.ts` re-exports `env`
- No direct `process.env.*` references remain in application code
- `pnpm type-check && pnpm lint && pnpm build` pass

## Open Questions

- Should `NODE_ENV` be included in the env config? It's a special Next.js compile-time constant and the pattern `env.nodeEnv === 'production'` may not work identically. Recommendation: keep `NODE_ENV` as direct `process.env.NODE_ENV` given its special status. No, don't include `NODE_ENV`.
- Should env vars use the `!` non-null assertion or provide runtime validation with error messages? Public vars are guaranteed at build time but a validation helper could improve DX. Yes.

## Testing Guidelines

No runtime logic changes are expected. Verification via `pnpm type-check && pnpm lint && pnpm build`.
