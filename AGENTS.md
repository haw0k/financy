# Agent quickstart

## Commands

- `pnpm dev` – start dev server (http://localhost:3000)
- `pnpm build` – production build
- `pnpm start` – start production server
- `pnpm lint` – lint check
- `pnpm lint:fix` – lint auto-fix
- `pnpm type-check` – TypeScript type check
- `pnpm format:check` – check code formatting
- `pnpm format:fix` – fix code formatting
- `pnpm clean` – clean build cache
- `pnpm lint && pnpm build` – full pre-deploy check
- `pnpm test` – run Vitest tests (watch mode)
- `pnpm test:run` – run Vitest tests (single run)

## Structure

- `app/` – Next.js app router (thin page re-exports)
  - `app/auth/` – Login, sign-up, OAuth callback, error pages
  - `app/dashboard/` – Protected routes (transactions, categories, settings)
  - `app/layout.tsx` – Root layout with ThemeProvider
- `components/pages/` – Page components (HomePage, auth/_, dashboard/_)
- `components/layouts/` – layout components (DashboardNav, Header, DashboardOverview, TransactionsTable, CategoriesTable, TransactionForm)
- `components/providers/` – React context providers (ThemeProvider, MobileNavContext)
- `components/ui/` – reusable UI components (PasswordField, DatePicker)
- `config/` – centralized configuration (env, routes, site, navigation)
- `_specs/` – feature specification documents
- `_plans/` – implementation plans
- `lib/shadcn/` – shadcn/ui component library (~50 components)
- `lib/supabase/` – Supabase client singleton pattern
- `hooks/` – custom hooks (useToast, useMobile)
- `scripts/001_init_database.sql` – Database schema + RLS policies
- `tests/` – Vitest test files

## Tech Stack

- Next.js 16.2.4 (App Router)
- React 19.2.5
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- pnpm as package manager

## Documentation

- Commit Message Convention: [Commit Message Convention](docs/commit-message-convention.md)
- Naming Conventions: [Naming Conventions](docs/naming-conventions.md)

## Spec-Driven Development

- All features must have a spec in `_specs/<feature-name>.md` before implementation
- Check `_specs/` for existing specs before starting any task
- When implementing, reference the spec and mark checklist items as done
- Never implement a feature without a corresponding spec file
- After completing a plan/spec task, update `_specs/_description.md` and `_plans/_description.md` to mark as completed

## Git conventions

- Always use `git switch` instead of `git checkout` for branch operations
