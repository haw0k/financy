# Financy - Setup Guide

This guide walks you through setting up the Financy application from scratch or recovering it after a Supabase infrastructure change.

If you prefer to run Supabase locally instead of using the cloud, follow [LOCAL_SETUP.md](./LOCAL_SETUP.md).

## Prerequisites

- A free [Supabase](https://supabase.com) account
- Node.js 18+ and pnpm installed
- A local checkout of this repository

## Step 1: Create a Supabase Project

1. Sign in to [supabase.com](https://supabase.com) and create a new project.
2. Pick a region close to your users.
3. Wait for the project to finish provisioning before moving on.

## Step 2: Configure Environment Variables

Create `.env.local` in the project root. You can copy the included example file and fill in your values:

```bash
cp .env.example .env.local
```

```bash
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_GOOGLE_CLIENT_ID=
NEXT_GOOGLE_CLIENT_SECRET=
```

### Where to find each value

| Variable | Where to find it | Required? |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → API Keys → Anon key / Publishable key (`default`) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → API Keys → Secret Keys → `default`. Keep this secret — it grants full database access | Yes |
| `DEV_SUPABASE_REDIRECT_URL` | Local callback route. Use `http://localhost:3000/auth/callback`. This overrides `SUPABASE_REDIRECT_URL` when `NODE_ENV=development` | Recommended for local dev |
| `SUPABASE_REDIRECT_URL` | Fallback/production callback URL. For local dev you can set it to `http://localhost:3000/auth/callback` because `DEV_SUPABASE_REDIRECT_URL` takes precedence | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL. Required in all environments; use `http://localhost:3000` locally | Yes |
| `NEXT_GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth credentials | Only for Google OAuth |
| `NEXT_GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth credentials | Only for Google OAuth |

## Step 3: Initialize the Database

The application uses a single SQL script to create all tables and triggers.

1. Go to your Supabase project dashboard.
2. Open **SQL Editor** from the left sidebar.
3. Create a **New query**.
4. Copy the entire contents of [`scripts/001_init_database.sql`](scripts/001_init_database.sql) into the editor.
5. Click **Run**.

This script intentionally drops all application tables before recreating them. Only run it on dev/test projects or when data loss is acceptable. It creates:

- `profiles` table with role (`sender`, `receiver`, `admin`) and status (`pending`, `approved`)
- `category_types` table
- `categories` table
- `currencies` table with default UAH, USD, and EUR
- `transactions` table
- Triggers that sync `app_metadata` on signup and on profile updates
- A unique partial index that enforces a single approved admin

## Step 4: Install Dependencies and Start the App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Step 5: Create the First Admin

The first admin must be created before regular users can register.

Make sure email confirmations are enabled in Supabase Dashboard → **Authentication** → **Settings** → **Email Confirmations**. They are enabled by default on new projects.

1. Open [http://localhost:3000/auth/admin](http://localhost:3000/auth/admin).
2. Fill in the admin email and password, then sign up.
3. Supabase will send a confirmation email.
4. Click the link in the email. If the link works, the application automatically approves the admin and redirects to `/admin`.

If the confirmation link expired or did not arrive, manually confirm the email and approve the admin:

1. Supabase Dashboard → **Authentication** → **Users** → find the admin user.
2. Click the user menu and select **Confirm email**.
3. Open the **SQL Editor** and run:

```sql
update public.profiles
set status = 'approved', updated_at = now()
where email = '<admin-email>';

update auth.users
set raw_app_meta_data = jsonb_build_object(
  'role', 'admin',
  'status', 'approved',
  'provider', 'email',
  'providers', '["email"]'::jsonb
)
where email = '<admin-email>';
```

4. Sign out and sign in again at `/auth/admin`.

Only one approved admin is allowed in the system.

## Step 6: Register Regular Users

1. Open [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up).
2. Choose a role (`sender` or `receiver`) and complete sign up.
3. Confirm the email via the link Supabase sends, or manually confirm it in the Dashboard.
4. The user lands on `/auth/pending` until the admin approves them.
5. The admin signs in at `/admin`, finds the pending user, and clicks **Approve**.
6. After approval, the user can sign in and access `/dashboard`.

## Available Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm check        # Biome check (lint + format + import order)
pnpm check:fix    # Auto-fix Biome issues
pnpm type-check   # TypeScript check
pnpm format:check # Check formatting only
pnpm format:fix   # Fix formatting only
pnpm clean        # Clean build cache
pnpm test         # Run Vitest tests (watch mode)
pnpm test:run     # Run Vitest tests (single run)
```

## Deployment to Vercel

1. Push the code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` to Vercel project settings.
4. Set `SUPABASE_REDIRECT_URL` to your production callback URL, for example `https://your-domain.com/auth/callback`.
5. Update `NEXT_PUBLIC_SITE_URL` from `http://localhost:3000` to your production domain, for example `https://your-domain.com`.
6. Leave `DEV_SUPABASE_REDIRECT_URL` unset on Vercel; it is only used for local development.
7. Deploy.

## Troubleshooting

### "Auth tables not found" or database errors after sign up

Make sure you ran [`scripts/001_init_database.sql`](scripts/001_init_database.sql) in the Supabase SQL Editor and that it completed without errors.

### The application stopped working after a Supabase pause

Free Supabase projects can be paused after inactivity. After reactivation, the instance may be recreated with a different `SUPABASE_URL` and an empty database.

1. Copy the new **Project URL** from Supabase Dashboard → Project Settings → API.
2. Update `SUPABASE_URL` in `.env.local`.
3. Re-run [`scripts/001_init_database.sql`](scripts/001_init_database.sql) in the SQL Editor.
4. Re-create the admin account by following [Step 5: Create the First Admin](#step-5-create-the-first-admin).
5. Existing users and transactions will be gone unless you have a separate backup.

### "Account Status: Check your email to confirm your admin account" persists after confirmation

This usually means the auto-approval trigger did not fire. Follow the manual confirmation and SQL approval steps in [Step 5: Create the First Admin](#step-5-create-the-first-admin), then sign out and sign in again.

### "Admin access denied" or redirect to `/dashboard`

- Check that the user's `profiles.status` is `approved`.
- Check that `auth.users.raw_app_meta_data` contains `"role": "admin"` and `"status": "approved"`.
- Sign out and sign in again so the JWT picks up the latest `app_metadata`.

### Google OAuth not working

1. Verify `NEXT_GOOGLE_CLIENT_ID` and `NEXT_GOOGLE_CLIENT_SECRET` are filled in in `.env.local`.
2. In Supabase Dashboard → **Authentication** → **Providers** → **Google**, paste the same **Client ID** and **Client Secret**, then enable the provider.
3. Copy the **Redirect URI** shown in the Supabase Google provider settings.
4. In [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials** → your OAuth client → **Authorized redirect URIs**, paste the Supabase Redirect URI and save.
5. Save the Google provider settings in Supabase.

### Dark mode not working

Clear browser cookies and refresh, or check that the [`ThemeProvider`](components/providers/ThemeProvider.tsx) is loaded.

## Architecture Overview

For the full database schema, tech stack, and project structure, see [`README.md`](README.md). The key points for setup are:

- Access control is enforced by Next.js middleware and Server Action guards, not by Row Level Security (RLS is intentionally disabled).
- The application uses Server Actions for all database mutations. There is no browser Supabase client.

## Notes

- Free Supabase tier includes 500 MB database storage.
- The application uses Server Actions for all database mutations. There is no browser Supabase client.
- For issues with Supabase, Next.js, or shadcn/ui, see the Support section in [`README.md`](README.md#support).
