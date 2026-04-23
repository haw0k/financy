# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financy is a full-stack financial management application built with Next.js 16.2.4 (App Router), React 19.2.5, and Supabase (PostgreSQL + Auth). It features role-based access (sender/receiver), transaction tracking, category management, and visual analytics via Recharts.

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
Browser → Supabase Auth → middleware.ts → Protected Routes (dashboard/*)
                ↓
         lib/supabase/
         ├── client.ts  # Browser client (createBrowserClient)
         ├── server.ts  # Server client (createServerClient)
         └── middleware.ts  # Session refresh logic
```

### Key Directories

- `app/` - Next.js App Router pages (thin re-exports)
  - `app/auth/` - Login, sign-up, OAuth callback, error pages
  - `app/dashboard/` - Protected routes (transactions, categories, settings)
  - `app/layout.tsx` - Root layout with ThemeProvider
- `components/pages/` - Page components (HomePage, auth/_, dashboard/_)
- `components/layout/` - App-specific components (DashboardNav, Header, DashboardOverview, TransactionsTable, CategoriesTable, TransactionForm)
- `lib/shadcn/` - shadcn/ui component library (~50 components)
- `lib/supabase/` - Supabase client singleton pattern
- `hooks/` - Custom hooks (useToast, useMobile)
- `scripts/001_init_database.sql` - Database schema + RLS policies
- `tests/` - Vitest test files

### Authentication Strategy

Middleware handles session refresh via `supabase.auth.getUser()`. Protected routes use server-side client with `AUTH_HEADER_KEY` cookie pattern. Client-side uses `createBrowserClient` with public anon key.

### Role System

Users have `sender` or `receiver` role (set at signup). RLS policies enforce:

- `profiles`: Users see only their own profile
- `categories`: Users see only their own categories
- `transactions`: Users see transactions where they are sender OR receiver

## Code Style

- **Formatting**: 100 char line width, single quotes, semicolons, trailing commas (es5)
- **ESLint**: Flat config with `eslint.config.mjs`, extends `eslint-config-next/core-web-vitals`
- **Prettier config** in `.prettierrc.json`
- shadcn/ui components in `lib/shadcn/` - use `import { Button } from "@/lib/shadcn"`

## Documentation

- Commit Message Convention: [Commit Message Convention](docs/commit-message-convention.md)
- Naming Conventions: [Naming Conventions](docs/naming-conventions.md)

## Spec-Driven Development

All features must have a spec in `_spec/<date>-<feature_slug>.md` before implementation. Check `_specs/` for existing specs before starting any task. When implementing, reference the spec and mark checklist items as done. Never implement a feature without a corresponding spec file. After completing a plan/spec task, update `_specs/_description.md` and `_plans/_description.md` to mark as completed.

## Git conventions

- Always use `git switch` instead of `git checkout` for branch operations
