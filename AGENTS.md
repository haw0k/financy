# Agent quickstart

## Commands

- `pnpm dev` – start dev server
- `pnpm build` – production build
- `pnpm start` – start production server
- `pnpm lint` – lint check
- `pnpm lint:fix` – lint auto-fix
- `pnpm type-check` – TypeScript type check
- `pnpm format:check` – check code formatting
- `pnpm format:fix` – fix code formatting
- `pnpm clean` – clean build cache
- `pnpm lint && pnpm build` – full pre-deploy check

## Structure

- `app/` – Next.js app router (thin page re-exports)
- `components/pages/` – Page components (HomePage, auth/*, dashboard/*)
- `components/layout/` – layout components
- `lib/shadcn/` – shadcn/ui component library
- `lib/supabase/` – utils, Supabase client
- `hooks/` – custom hooks
- `proxy.ts` – Edge middleware

## Env

- `.env` contains secrets (gitignored). Use `.env.example` as template.
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- `.env.local` is gitignored but available locally
- Next.js 16.2, Tailwind CSS v4
- Uses pnpm as package manager
