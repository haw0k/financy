# Financy - Local Supabase Setup Guide

This guide explains how to run Financy entirely on your local machine using the [Supabase CLI](https://supabase.com/docs/guides/cli). No cloud Supabase project is required.

## Prerequisites

- Node.js 18+ and pnpm
- Docker Desktop or Docker Engine running locally
- Supabase CLI installed ([installation instructions](https://supabase.com/docs/guides/cli/getting-started))
- A local checkout of this repository

## Step 1: Install the Supabase CLI

Follow the official guide for your operating system:

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux / npm
npm install -g supabase
```

Verify the installation:

```bash
supabase --version
```

## Step 2: Start the Local Supabase Stack

From the project root, run:

```bash
supabase init
supabase start
```

`supabase init` creates a `supabase/` directory with local configuration. `supabase start` pulls Docker images and starts the local services.

After startup, the terminal prints the local credentials. Look for these values:

| Local service | URL |
| --- | --- |
| Supabase Studio (UI) | `http://127.0.0.1:54323` |
| Supabase API | `http://127.0.0.1:54321` |
| Postgres database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Inbucket (test email) | `http://127.0.0.1:54324` |

You will also see an **anon key** and a **service_role key** in the output. Copy both for the next step.

## Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<local-anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key-from-supabase-start>
DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_GOOGLE_CLIENT_ID=
NEXT_GOOGLE_CLIENT_SECRET=
```

Paste the **anon key** and **service_role key** printed by `supabase start`.

## Step 4: Initialize the Database

The application uses [`scripts/001_init_database.sql`](scripts/001_init_database.sql) to create tables and triggers.

### Option A: Using psql

If you have `psql` installed:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f scripts/001_init_database.sql
```

### Option B: Using Supabase Studio

1. Open `http://127.0.0.1:54323`.
2. Click **SQL Editor** in the left sidebar.
3. Create a new query.
4. Copy the entire contents of [`scripts/001_init_database.sql`](scripts/001_init_database.sql) into the editor.
5. Click **Run**.

This script intentionally drops all application tables before recreating them. Only run it on local dev instances or when data loss is acceptable. It creates:

- `profiles` table with role (`sender`, `receiver`, `admin`) and status (`pending`, `approved`)
- `category_types` table
- `categories` table
- `currencies` table with default UAH, USD, and EUR
- `transactions` table
- Triggers that sync `app_metadata` on signup and on profile updates
- A unique partial index that enforces a single approved admin

## Step 5: Install Dependencies and Start the App

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Step 6: Create the First Admin

The first admin must be created before regular users can register.

1. Open [http://localhost:3000/auth/admin](http://localhost:3000/auth/admin).
2. Fill in the admin email and password, then sign up.
3. Supabase Auth sends a confirmation email to the local Inbucket server.
4. Open [http://127.0.0.1:54324](http://127.0.0.1:54324), find the confirmation email, and click the link.
5. The application approves the admin automatically and redirects to `/admin`.

If the confirmation link expired or Inbucket did not show the email, confirm the email in Supabase Studio and approve the admin manually:

1. Open `http://127.0.0.1:54323` → **Authentication** → **Users**.
2. Click the user menu and select **Confirm email**.
3. Open **SQL Editor** and run:

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

## Step 7: Register Regular Users

1. Open [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up).
2. Choose a role (`sender` or `receiver`) and complete sign up.
3. Confirm the email via the Inbucket link, or confirm it manually in Supabase Studio.
4. The user lands on `/auth/pending` until the admin approves them.
5. The admin signs in at `/admin`, finds the pending user, and clicks **Approve**.
6. After approval, the user can sign in and access `/dashboard`.

## Managing the Local Stack

### Stop the local services

```bash
supabase stop
```

### Reset the local database

This destroys all local data and reapplies initialization migrations:

```bash
supabase db reset
```

After resetting, re-run [`scripts/001_init_database.sql`](scripts/001_init_database.sql) and recreate the admin account.

### Update Supabase CLI

```bash
supabase --version          # check current version
# macOS
brew upgrade supabase

# npm
npm install -g supabase
```

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

## Troubleshooting

### `supabase start` fails with a Docker error

Make sure Docker is running. On Windows and macOS, start Docker Desktop. On Linux, make sure the Docker daemon is active.

### `supabase start` reports port conflicts

Another service may be using the default Supabase ports. Stop the conflicting service, or run Supabase on different ports:

```bash
supabase start --port 54331
```

Update `SUPABASE_URL` in `.env.local` to match the new API port.

### Database script fails with "relation `auth.users` does not exist"

The local Auth service may still be initializing. Wait a few seconds and re-run the script.

### Confirmation email does not appear in Inbucket

1. Verify Inbucket is running at `http://127.0.0.1:54324`.
2. Check that `DEV_SUPABASE_REDIRECT_URL` is set to `http://localhost:3000/auth/callback`.
3. Manually confirm the email in Supabase Studio → **Authentication** → **Users**.

### "Admin access denied" or redirect to `/dashboard`

- Check that the user's `profiles.status` is `approved`.
- Check that `auth.users.raw_app_meta_data` contains `"role": "admin"` and `"status": "approved"`.
- Sign out and sign in again so the JWT picks up the latest `app_metadata`.

### App cannot connect to Supabase after restarting the stack

`supabase stop` followed by `supabase start` keeps the same API URL and keys by default. If you ran `supabase db reset` or removed Docker volumes, re-apply the SQL script and recreate the admin account.

## Differences from Cloud Supabase

| Topic | Cloud Supabase | Local Supabase |
| --- | --- | --- |
| Hosting | Supabase Cloud | Docker on your machine |
| Database URL | Project-specific | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Email delivery | Supabase / custom SMTP | Inbucket test server |
| Project pause | Free projects pause after inactivity | No pause |
| Backups | Automatic on paid tiers | Your responsibility |

For a cloud-based setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).
