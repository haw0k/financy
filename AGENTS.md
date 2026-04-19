# Agent quickstart

## Commands
- `pnpm dev` – start dev server
- `pnpm build` – production build
- `pnpm lint` – lint check
- `pnpm lint && pnpm build` – full pre-deploy check

## Structure
- `app/` – Next.js app router
- `components/` – UI component library
- `lib/` – utils, Supabase client, hooks
- `middleware.ts` – Edge middleware

## Env
- `.env` contains secrets (gitignored). Use `.env.example` as template.
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes
- `.env.local` is gitignored but available locally
- Next.js 16.2, Tailwind CSS v4
- Uses pnpm as package manager
