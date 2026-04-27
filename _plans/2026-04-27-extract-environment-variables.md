# Plan: Extract Environment Variables

Spec: `_specs/2026-04-27-extract-environment-variables.md`
Branch: `refactor/extract-environment-variables`

## Context

`process.env.*` references are duplicated across 4 files (3 Supabase client files + SignUpPage). Centralizing them into a single typed `env` object provides a single source of truth. `NODE_ENV` is excluded per spec decision. The middleware requires special handling since it needs to gracefully skip when Supabase isn't configured during initial setup.

## Design Decisions

- **`!` assertion in `env.config.ts`**: Required env vars use `!` assertion rather than a throwing `requireEnv()` helper, because the middleware needs to gracefully check for missing vars at runtime without crashing at import time
- **Middleware keeps its guard**: The existing `if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse;` stays, accessing `env.supabaseUrl` / `env.supabaseAnonKey` which will be `undefined` if missing (since `!` only satisfies TypeScript, doesn't throw)
- **client.ts/server.ts keep validation**: Their existing descriptive error messages are preserved — they'll use `env.*` values but still check and throw with the helpful message

## Changes

### 1. Create `config/env.config.ts`

```ts
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  devSupabaseRedirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL,
} as const;
```

### 2. Update `config/index.ts`

Add: `export { env } from './env.config';`

### 3. Update `lib/supabase/client.ts`

Replace `process.env.NEXT_PUBLIC_SUPABASE_URL` → `env.supabaseUrl`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` → `env.supabaseAnonKey`. Keep existing validation block. Add `import { env } from '@/config';`.

### 4. Update `lib/supabase/server.ts`

Same as client.ts — replace `process.env.*` references, keep validation, add import.

### 5. Update `lib/supabase/middleware.ts`

Replace `process.env.NEXT_PUBLIC_SUPABASE_URL` → `env.supabaseUrl`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` → `env.supabaseAnonKey`. Keep the existing guard. Add import.

### 6. Update `components/pages/auth/SignUpPage.tsx`

Replace `process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` → `env.devSupabaseRedirectUrl`. Add `import { env } from '@/config';`.

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- All existing behavior preserved (env vars resolve identically)
