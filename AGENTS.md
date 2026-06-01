# AI Agent Guide

This file provides guidance to AI coding assistants (Claude Code, opencode, Cursor, etc.) when working with code in this repository.

## Project Overview

Financy is a full-stack financial management application built with Next.js 16.2.4 (App Router), React 19.2.5, and Supabase (PostgreSQL + Auth). It features role-based access (sender/receiver/admin) with registration approval, transaction tracking, category management, and visual analytics via Recharts.

**Important**: This is a pet project. RLS is intentionally disabled in the database. All authenticated users share the same data pool without ownership checks.

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
         app/actions/           lib/supabase/         config/
         ├── auth.ts             ├── server.ts         ├── env.config.ts
         ├── categories.ts       ├── middleware.ts     ├── routes.config.ts
         ├── transactions.ts     └── admin.ts          ├── site.config.ts
         └── dashboard.ts                            └── navigation.config.ts
```

### Key Directories

- `app/` - Next.js App Router pages (thin re-exports)
  - `app/auth/` - Login, sign-up, admin auth, pending, OAuth callback, error pages
  - `app/dashboard/` - Protected routes (transactions, categories, settings)
  - `app/admin/` - Admin dashboard (pending user management)
  - `app/api/` - API routes (admin pending-users CRUD, check-admin)
  - `app/actions/` - Server Actions for auth, categories, transactions, dashboard
  - `app/layout.tsx` - Root layout with ThemeProvider + RoleProvider
- `components/pages/` - Page components (HomePage, auth/_, dashboard/_, admin/\*)
- `components/layouts/` - Layout components (DashboardNav, Header, MobileNav, DashboardOverview, TransactionsTable, CategoriesTable, TransactionForm)
- `components/providers/` - React context providers (ThemeProvider, MobileNavContext, RoleProvider)
- `components/ui/` - Reusable UI components (PasswordField, DatePicker, ToastNotification)
- `lib/shadcn/` - shadcn/ui component library (~50 components)
- `lib/supabase/` - Supabase clients (server, middleware, admin) — **no browser client**
- `lib/db-errors.ts` - PostgreSQL error code mapping for user-friendly messages
- `config/` - Centralized configuration (env, routes, site, navigation)
- `hooks/` - Custom hooks (useRole, useToast, useMobile, useHandler)
- `enums/` - TypeScript enums (ERole, EProfileStatus)
- `interfaces/` - TypeScript interfaces (transactions, categories, stats)
- `scripts/001_init_database.sql` - Database schema
- `tests/` - Vitest test files
- `_specs/` - Feature specification documents
- `_plans/` - Implementation plans

### Supabase Client Types

There are **3** Supabase clients — the browser client was removed in favor of Server Actions:

| Client     | File                                   | Key          | When to use                                   |
| ---------- | -------------------------------------- | ------------ | --------------------------------------------- |
| Server     | `lib/supabase/server.ts`               | Anon key     | Server Components, Server Actions, API routes |
| Middleware | Inline in `lib/supabase/middleware.ts` | Anon key     | Session refresh, redirects                    |
| Admin      | `lib/supabase/admin.ts`                | Service role | Admin operations (approve/delete users)       |

The admin client uses `@supabase/supabase-js` directly (not `@supabase/ssr`) with `autoRefreshToken: false, persistSession: false`. Always validate caller authorization before using it.

### Server Actions Pattern

All data mutations go through Server Actions in `app/actions/`:

- `auth.ts` — login, signUp, adminLogin, adminSignUp, signOut, getRole
- `categories.ts` — CRUD for categories and category types
- `transactions.ts` — CRUD for transactions, get receivers list
- `dashboard.ts` — get transactions + stats for dashboard overview

All actions use `createClient()` from `@/lib/supabase/server` and return `TActionResult<T>` or `TAuthResult`.

### Middleware / Proxy Pattern

The app uses Next.js proxy mode: `proxy.ts` exports a `proxy` function (invoked by Next.js) that delegates to `updateSession()` in `lib/supabase/middleware.ts`. The matcher in `proxy.ts` controls which paths the middleware runs on. Update both files when adding new protected routes.

Middleware checks:

- `/admin/*`: no user → `/auth/login`; email not confirmed → `/auth/pending`; profile role != Admin or status != Approved → `/dashboard`
- `/dashboard/*`: user exists + profile status != Approved → `/auth/pending`

### Role System & Permissions

Users have `sender`, `receiver`, or `admin` role (set at signup). Each profile has a `status` field (`pending` | `approved`). First admin is auto-approved by a database trigger; regular users require admin approval before accessing the dashboard.

**Single Admin Policy**: Only **one admin** is allowed in the system. The `adminSignUpAction` server action validates that no approved admin exists before allowing signup. This is enforced server-side.

**RLS is intentionally disabled** for simplicity. This is a pet project with no data ownership checks.

| Role       | Can do in `/admin`           | Can do in `/dashboard`                                |
| ---------- | ---------------------------- | ----------------------------------------------------- |
| `admin`    | Approve/reject registrations | **Nothing** — admin does not access financial data    |
| `sender`   | No access (redirected)       | Full CRUD on categories, category types, transactions |
| `receiver` | No access (redirected)       | Full CRUD on categories, category types, transactions |

All authenticated users (sender/receiver) share the same data pool. Any user can create, edit, or delete any category, category type, or transaction.

Admin-specific flows:

- `/auth/admin` — admin signup (if no admin exists) or login
- `/admin` — manage pending user registrations (approve/reject) — **this is the admin's only function**
- `/auth/pending` — shown to users awaiting admin approval or email confirmation

### Registration & Approval Flow

Supabase project has **"Enable email confirmations" ON** (default). Confirmation emails are sent on every signup.

**JWT App Metadata**: Database triggers (`handle_new_user` and `handle_profile_update`) automatically populate `app_metadata` with `role` and `status` on signup and profile updates. This allows reading role/status directly from the JWT token without an extra database query.

**Admin registration** (`/auth/admin`):

1. **First admin only**: Signs up → server action checks no approved admin exists → DB trigger auto-sets `status = 'approved'` + updates `app_metadata`
2. Supabase sends confirmation email → admin clicks link → callback exchanges code → checks profile (admin + approved) → redirects to `/admin`
3. Subsequent logins: `signInWithPassword` → `router.push('/admin')` → middleware verifies user, email_confirmed_at, profile role/status → `/admin`

**Important**: Only **one admin** is allowed. The `adminSignUpAction` server action checks for an existing approved admin before allowing signup. If an approved admin already exists, the signup fails with an error.

**Regular user registration** (`/auth/sign-up`):

1. User signs up WITHOUT `emailRedirectTo` → DB trigger sets `status = 'pending'` + updates `app_metadata`
2. Supabase sends confirmation email (project setting, not `emailRedirectTo`)
3. User clicks email link → callback exchanges code → not admin → redirects to `/dashboard`
4. Middleware at `/dashboard` checks `profile.status` → `'pending'` → redirects to `/auth/pending`
5. Admin approves via `/admin` → API sets `profile.status = 'approved'` → DB trigger updates `app_metadata` → email confirmation refreshes JWT
6. User accesses `/dashboard` → middleware sees `status = 'approved'` (from JWT or profiles) → access granted

**Reject flow** (`/api/admin/pending-users/reject`):

- Calls `adminClient.auth.admin.deleteUser(userId)` — cascade deletes the profile row

**Self-protection**: admin cannot approve/reject their own account (checked both in API routes and UI).

### Middleware redirects summary

| Path           | Condition                           | Redirect        |
| -------------- | ----------------------------------- | --------------- |
| `/admin/*`     | no user                             | `/auth/login`   |
| `/admin/*`     | email not confirmed                 | `/auth/pending` |
| `/admin/*`     | role != Admin or status != Approved | `/dashboard`    |
| `/dashboard/*` | user exists, status != Approved     | `/auth/pending` |

## Code Style

- **Formatting**: 100 char line width, single quotes, semicolons, trailing commas (es5), LF line endings
- **ESLint**: Flat config with `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals`
- **Prettier** config in `.prettierrc.json`
- **Import order**: enforced by `import/order` rule — react first, then externals, then `@/lib/shadcn` internals, then `@/components/*`, `@/hooks/*`, `@/lib/*`
- shadcn/ui components imported from `@/lib/shadcn` — `import { Button } from "@/lib/shadcn"`

### Hungarian Notation (strict ESLint rules)

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

Mock `next/navigation` and Server Actions similarly at module level. Always use `vi.clearAllMocks()` in `beforeEach`.

**Important**: `vi.mock` factory functions are hoisted — do NOT reference top-level variables inside the factory. Use `vi.fn()` directly inside the factory:

```ts
// ✅ Correct
vi.mock('@/app/actions/auth', () => ({
  signOutAction: vi.fn(() => Promise.resolve({ isSuccess: true })),
}));

// ❌ Wrong — will cause "Cannot access before initialization"
const mockSignOut = vi.fn();
vi.mock('@/app/actions/auth', () => ({
  signOutAction: mockSignOut,
}));
```

## Configuration

### Environment Variables

```
SUPABASE_URL=                    # Supabase project URL
SUPABASE_ANON_KEY=               # Public anon key
DEV_SUPABASE_REDIRECT_URL=       # Local dev redirect (optional)
SUPABASE_REDIRECT_URL=           # Production redirect URL (optional)
SUPABASE_SERVICE_ROLE_KEY=       # Service role key (server-side only)
```

The optional `DEV_SUPABASE_REDIRECT_URL` env var provides a local development redirect override for the sign-up flow. Use `getSupabaseRedirectUrl()` from `@/config` — it selects `DEV_SUPABASE_REDIRECT_URL` in development, or `SUPABASE_REDIRECT_URL` in production.

## Spec-Driven Development

- All features must have a spec in `_specs/<date>-<feature_slug>.md` before implementation
- Check `_specs/` for existing specs before starting any task
- When implementing, reference the spec and mark checklist items as done
- Never implement a feature without a corresponding spec file
- After completing a plan/spec task, update `_specs/_description.md` and `_plans/_description.md` to mark as completed

## Documentation

- Commit Message Convention: [Commit Message Convention](docs/commit-message-convention.md)
- Naming Conventions: [Naming Conventions](docs/naming-conventions.md)

## Git conventions

- Always use `git switch` instead of `git checkout` for branch operations
