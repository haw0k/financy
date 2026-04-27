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
         lib/supabase/         config/
         ├── client.ts         ├── env.config.ts
         ├── server.ts         ├── routes.config.ts
         └── middleware.ts     ├── site.config.ts
                               └── navigation.config.ts
```

### Configuration Pattern

Application configuration is centralized in `config/` and re-exported from `@/config`. Each domain has its own file with a `const` assertion (`as const`) for type safety:

- `env.config.ts` - Typed environment variables from `process.env`
- `routes.config.ts` - Route path constants
- `site.config.ts` - Site metadata (name, description, accent color, version)
- `navigation.config.ts` - Navigation item definitions with icons

The optional `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` env var provides a local development redirect override for the sign-up flow.

### Key Directories

- `app/` - Next.js App Router pages (thin re-exports)
  - `app/auth/` - Login, sign-up, OAuth callback, error pages
  - `app/dashboard/` - Protected routes (transactions, categories, settings)
  - `app/layout.tsx` - Root layout with ThemeProvider
- `components/pages/` - Page components (HomePage, auth/_, dashboard/_)
- `components/layouts/` - Dashboard layout components (DashboardNav, Header)
- `components/providers/` - React context providers (ThemeProvider, MobileNavContext)
- `components/ui/` - Reusable UI components (PasswordField, DatePicker)
- `components/pages/` - Page components (HomePage, auth/_, dashboard/_)
- `lib/shadcn/` - shadcn/ui component library (~50 components)
- `lib/supabase/` - Supabase client singleton pattern
- `config/` - Centralized configuration (env, routes, site, navigation)
- `hooks/` - Custom hooks (useToast, useMobile)
- `scripts/001_init_database.sql` - Database schema + RLS policies
- `tests/` - Vitest test files
- `_specs/` - Feature specification documents
- `_plans/` - Implementation plans

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

All features must have a spec in `_specs/<date>-<feature_slug>.md` before implementation. Check `_specs/` for existing specs before starting any task. When implementing, reference the spec and mark checklist items as done. Never implement a feature without a corresponding spec file. After completing a plan/spec task, update `_specs/_description.md` and `_plans/_description.md` to mark as completed.

## Git conventions

- Always use `git switch` instead of `git checkout` for branch operations
