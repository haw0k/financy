# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financy is a full-stack financial management application built with Next.js 16.2.4 (App Router), React 19.2.5, and Supabase (PostgreSQL + Auth). It features role-based access (sender/receiver/admin) with registration approval, transaction tracking, category management, and visual analytics via Recharts.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Lint check
pnpm lint:fix     # Auto-fix lint issues
pnpm type-check   # TypeScript check
pnpm format:check # Check formatting
pnpm format:fix   # Fix formatting
pnpm clean        # Clean .next build cache
pnpm lint && pnpm build  # Full pre-deploy check
pnpm test            # Run Vitest tests (watch mode)
pnpm test:run        # Run Vitest tests (single run)
```

## Architecture

### Data Flow

```
Browser → Supabase Auth → middleware.ts → Protected Routes (dashboard/*, admin/*)
                ↓
         lib/supabase/         config/             enums/
         ├── client.ts         ├── env.config.ts   ├── role.enum.ts
         ├── server.ts         ├── routes.config.ts├── profile-status.enum.ts
         ├── middleware.ts     ├── site.config.ts  └── index.ts
         └── admin.ts          └── navigation.config.ts
```

### Configuration Pattern

Application configuration is centralized in `config/` and re-exported from `@/config`. Each domain has its own file with a `const` assertion (`as const`) for type safety:

- `env.config.ts` - Typed environment variables from `process.env`
- `routes.config.ts` - Route path constants
- `site.config.ts` - Site metadata (name, description, accent color, version)
- `navigation.config.ts` - Navigation item definitions with icons

The optional `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` env var provides a local development redirect override for the sign-up flow. Use `getSupabaseRedirectUrl()` from `@/config` — it selects `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` in development, or `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` in production.

### Key Directories

- `app/` - Next.js App Router pages (thin re-exports)
  - `app/auth/` - Login, sign-up, admin auth, pending, OAuth callback, error pages
  - `app/dashboard/` - Protected routes (transactions, categories, settings)
  - `app/admin/` - Admin dashboard (pending user management)
  - `app/api/` - API routes (admin pending-users CRUD, check-admin)
  - `app/layout.tsx` - Root layout with ThemeProvider
- `components/pages/` - Page components (HomePage, auth/_, dashboard/_, admin/\*)
- `components/layouts/` - Dashboard layout components (DashboardNav, Header, MobileNav)
- `components/providers/` - React context providers (ThemeProvider, MobileNavContext)
- `components/ui/` - Reusable UI components (PasswordField, DatePicker)
- `lib/shadcn/` - shadcn/ui component library (~50 components)
- `lib/supabase/` - Supabase clients (client, server, middleware, admin)
- `config/` - Centralized configuration (env, routes, site, navigation)
- `hooks/` - Custom hooks (useRole, useToast, useMobile, useHandler)
- `enums/` - TypeScript enums (ERole, EProfileStatus)
- `interfaces/` - TypeScript interfaces (transactions, categories, stats)
- `scripts/001_init_database.sql` - Database schema + RLS policies
- `tests/` - Vitest test files
- `_specs/` - Feature specification documents
- `_plans/` - Implementation plans

### Supabase Client Types

There are 4 different Supabase clients — use the right one for each context:

| Client     | File                                   | Key          | When to use                                         |
| ---------- | -------------------------------------- | ------------ | --------------------------------------------------- |
| Browser    | `lib/supabase/client.ts`               | Anon key     | Client Components (`'use client'`)                  |
| Server     | `lib/supabase/server.ts`               | Anon key     | Server Components, API routes (with cookies)        |
| Middleware | Inline in `lib/supabase/middleware.ts` | Anon key     | Session refresh, redirects                          |
| Admin      | `lib/supabase/admin.ts`                | Service role | Admin operations (approve/delete users, bypass RLS) |

The admin client uses `@supabase/supabase-js` directly (not `@supabase/ssr`) with `autoRefreshToken: false, persistSession: false`. It bypasses RLS — always validate caller authorization before using it.

### Middleware / Proxy Pattern

The app uses Next.js proxy mode: `proxy.ts` exports a `proxy` function (invoked by Next.js) that delegates to `updateSession()` in `lib/supabase/middleware.ts`. The matcher in `proxy.ts` controls which paths the middleware runs on. Update both files when adding new protected routes.

Middleware checks:

- `/admin/*`: no user → `/auth/login`; email not confirmed → `/auth/pending`; not approved admin → `/dashboard`
- `/dashboard/*`: email not confirmed → `/auth/pending`

### Authentication Strategy

Middleware handles session refresh via `supabase.auth.getUser()`. Protected routes use server-side client with cookie-based session. Client-side uses `createBrowserClient` with public anon key.

### Role System

Users have `sender`, `receiver`, or `admin` role (set at signup). Each profile has a `status` field (`pending` | `approved`). First admin is auto-approved by a database trigger; regular users require admin approval before accessing the dashboard.

RLS policies enforce:

- `profiles`: Users see only their own profile; admins with approved status see all profiles
- `categories`: All authenticated users can manage categories
- `transactions`: Users see transactions where they are sender OR receiver

Admin-specific flows:

- `/auth/admin` — admin signup (if no admin exists) or login
- `/admin` — manage pending user registrations (approve/reject)
- `/auth/pending` — shown to users awaiting admin approval or email confirmation

## Code Style

- **Formatting**: 100 char line width, single quotes, semicolons, trailing commas (es5), LF line endings
- **ESLint**: Flat config with `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals`
- **Prettier** config in `.prettierrc.json`
- **Import order**: enforced by `import/order` rule — react first, then externals, then `@/lib/shadcn` internals, then `@/components/*`, `@/hooks/*`, `@/lib/*`
- shadcn/ui components imported from `@/lib/shadcn` — `import { Button } from "@/lib/shadcn"`

### Hungarian Notation (strict lint rules)

| Construct        | Prefix                      | Example                        | Rule         |
| ---------------- | --------------------------- | ------------------------------ | ------------ |
| Enum             | `E` + PascalCase (singular) | `ERole`, `EProfileStatus`      | `/^E[A-Z]/u` |
| Interface        | `I` + PascalCase            | `ITransaction`, `IPendingUser` | `/^I[A-Z]/u` |
| Type alias       | `T` + PascalCase            | `TAPISearchParams`             | `/^T[A-Z]/u` |
| Boolean variable | `is` + PascalCase           | `isLoading`, `isAdminExist`    | Prefix `is`  |
| Boolean property | `is` + PascalCase           | `isOpen`                       | Prefix `is`  |

These are enforced by `@typescript-eslint/naming-convention`. Failing to follow them will cause lint errors. See [Naming Conventions](docs/naming-conventions.md) for full details.

## Test Patterns

Tests use Vitest + `@testing-library/react` + jsdom. A setup file at `tests/setup.ts` calls `cleanup()` after each test.

When testing components that use `useRole()`:

```ts
// Module-level mock state — mutate in tests before dynamic import
let useRoleReturn = {
  role: ERole.Admin,
  status: EProfileStatus.Approved,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks', () => ({
  useRole: () => useRoleReturn,
}));

// Use dynamic import AFTER setting mock state to avoid hoisting issues:
const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
```

Mock `next/navigation` and Supabase clients similarly at module level. Always use `vi.clearAllMocks()` in `beforeEach`.

## Spec-Driven Development

All features must have a spec in `_specs/<date>-<feature_slug>.md` before implementation. Check `_specs/` for existing specs before starting any task. When implementing, reference the spec and mark checklist items as done. Never implement a feature without a corresponding spec file. After completing a plan/spec task, update `_specs/_description.md` and `_plans/_description.md` to mark as completed.

## Documentation

- Commit Message Convention: [Commit Message Convention](docs/commit-message-convention.md)
- Naming Conventions: [Naming Conventions](docs/naming-conventions.md)

## Git conventions

- Always use `git switch` instead of `git checkout` for branch operations
