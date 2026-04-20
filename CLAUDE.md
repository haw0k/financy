# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financy is a full-stack financial management application built with Next.js 16 (App Router), React 19, and Supabase (PostgreSQL + Auth). It features role-based access (sender/receiver), transaction tracking, category management, and visual analytics via Recharts.

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
- `components/pages/` - Page components (HomePage, auth/*, dashboard/*)
- `components/layout/` - App-specific components (dashboard-nav, header, etc.)
- `lib/shadcn/` - shadcn/ui component library
- `lib/supabase/` - Supabase client singleton pattern
- `hooks/` - Custom hooks (useToast, useMobile)
- `scripts/001_init_database.sql` - Database schema + RLS policies

### Authentication Strategy

Middleware handles session refresh via `supabase.auth.getUser()`. Protected routes use server-side client with `AUTH_HEADER_KEY` cookie pattern. Client-side uses `createBrowserClient` with public anon key.

### Role System

Users have `sender` or `receiver` role (set at signup). RLS policies enforce:
- `profiles`: Users see only their own profile
- `categories`: Users see only their own categories
- `transactions`: Users see transactions where they are sender OR receiver

## Code Style

- **Formatting**: 100 char line width, single quotes, semicolons, trailing commas (es5)
- **ESLint**: Flat config with `eslint.config.mjs`, extends `eslint-config-next`
- **Prettier config** in `.prettierrc.json`
- shadcn/ui components in `lib/shadcn/` - use `import { Button } from "@/lib/shadcn"`

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key
```

## Database Schema

Three tables with RLS: `profiles` (id, role, user_id), `categories` (id, name, type, user_id), `transactions` (id, amount, type, category_id, sender_id, receiver_id, description, date). Default categories created by SQL migration script in `scripts/001_init_database.sql`.

## Documentation

- Naming conventions: [Naming Conventions](docs/naming-conventions.md)
