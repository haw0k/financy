# Plan: Extract Route Constants

Spec: `_specs/2026-04-26-extract-route-constants.md`
Branch: `refactor/extract-route-constants`

## Context

All route paths (e.g. `'/dashboard'`, `'/auth/login'`) are currently hardcoded as string literals across 10+ files. This creates duplication and makes route changes error-prone. Uses a single `routes` object for clean namespacing.

## Changes

### 1. Create `config/routes.config.ts`

```ts
export const routes = {
  dashboard: '/dashboard',
  transactions: '/dashboard/transactions',
  categories: '/dashboard/categories',
  settings: '/dashboard/settings',
  login: '/auth/login',
  signUp: '/auth/sign-up',
  signUpSuccess: '/auth/sign-up-success',
  authCallback: '/auth/callback',
  authError: '/auth/error',
} as const;
```

### 2. Update `config/index.ts`

Add: `export { routes } from './routes.config';`

### 3. Update `config/navigation.config.ts`

Import `routes` from `'./routes.config'` and use `routes.dashboard`, `routes.transactions`, `routes.categories`, `routes.settings` in `navItems`.

### 4. Replace hardcoded strings in 10 component/page files

Each file gets `import { routes } from '@/config';` and string replacements:

| File                                          | Replacements                                                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/layouts/DashboardNav.tsx`         | `href="/dashboard"` → `href={routes.dashboard}`                                                                                                                                         |
| `components/layouts/Header.tsx`               | `push('/auth/login')` → `push(routes.login)`, `href="/dashboard"` → `href={routes.dashboard}`                                                                                           |
| `components/layouts/MobileNav.tsx`            | `href="/dashboard"` → `href={routes.dashboard}`                                                                                                                                         |
| `components/pages/HomePage.tsx`               | `redirect('/dashboard')` → `redirect(routes.dashboard)`, `redirect('/auth/login')` → `redirect(routes.login)`                                                                           |
| `components/pages/auth/LoginPage.tsx`         | `push('/dashboard')` → `push(routes.dashboard)`, `href="/auth/sign-up"` → `href={routes.signUp}`                                                                                        |
| `components/pages/auth/SignUpPage.tsx`        | `` `${origin}/auth/callback` `` → `` `${origin}${routes.authCallback}` ``, `push('/auth/sign-up-success')` → `push(routes.signUpSuccess)`, `href="/auth/login"` → `href={routes.login}` |
| `components/pages/auth/SignUpSuccessPage.tsx` | `href="/auth/login"` → `href={routes.login}`                                                                                                                                            |
| `app/dashboard/layout.tsx`                    | `redirect('/auth/login')` → `redirect(routes.login)`                                                                                                                                    |
| `app/auth/callback/route.ts`                  | `?? '/dashboard'` → `?? routes.dashboard`, `` `${origin}/auth/error` `` → `` `${origin}${routes.authError}` ``                                                                          |
| `lib/supabase/middleware.ts`                  | `startsWith('/dashboard')` → `startsWith(routes.dashboard)`, `pathname = '/auth/login'` → `pathname = routes.login`                                                                     |

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
