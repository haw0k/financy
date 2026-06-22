# Finance Tracker - Setup Guide

## Prerequisites

- Supabase project (Free tier is sufficient)
- Node.js 18+ and pnpm installed

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from the API settings

### 1.2 Set Environment Variables

Create or update `.env.local` in your project root:

```bash
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

For local development, you can optionally set a redirect URL override:

```bash
DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from your Supabase project.

## Step 2: Initialize the Database

### 2.1 Run SQL Migration

1. Go to your Supabase project dashboard
2. Open **SQL Editor** from the left sidebar
3. Create a new query and copy-paste the entire content from `scripts/001_init_database.sql`
4. Click "Run" to execute the script
5. If you previously ran `002_add_role_to_jwt_metadata.sql`, re-run it after `001_init_database.sql` so the trigger versions stay aligned

This will create:

- `profiles` table (users with roles: sender/receiver/admin)
- `categories` table (income/expense categories)
- `transactions` table (payment transactions)
- Triggers that keep JWT `app_metadata` in sync with profile role/status

### 2.2 Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your OAuth credentials (get them from [Google Cloud Console](https://console.cloud.google.com))

## Step 3: Run the Application

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Visit `http://localhost:3000` and start using the app!

## Available Commands

```bash
pnpm dev          # Start dev server
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # Lint check
pnpm lint:fix    # Auto-fix lint issues
pnpm type-check  # TypeScript check
pnpm format:check # Check formatting
pnpm format:fix  # Fix formatting
pnpm check       # Combined lint + format check
pnpm check:fix   # Combined lint + format auto-fix
pnpm clean       # Clean build cache
```

## Features

### Authentication

- **Email/Password Sign Up**: Create account with email and password
- **Role Selection**: Choose between "Sender" (send money) or "Receiver" (receive money)
- **Email Confirmation**: Confirm your email before accessing the dashboard

### Dashboard

- **Overview Tab**: View income/expense summary with charts
- **Transactions Tab**: View all transactions with filters and CRUD operations
- **Categories Tab**: Manage expense categories
- **Settings Tab**: Account preferences and dark mode toggle

### Data Security

- **Authentication Required**: All dashboard routes are protected
- **Password Hashing**: Passwords are securely hashed by Supabase
- **Approval Check**: Server Actions reject pending users even if they bypass middleware

## Default Test Data

After database initialization, the SQL script creates default categories:

- **Income**: Salary, Freelance, Investments, Other Income
- **Expenses**: Food, Transport, Entertainment, Utilities, Other Expenses

You can add more categories from the Categories tab in the dashboard.

## Troubleshooting

### "Auth tables not found" error

- Make sure you ran the SQL script in Supabase SQL Editor
- Verify the script executed without errors

### "User not found" after sign up

- Check that your email is confirmed in Supabase Authentication
- Wait a moment and refresh the page

### Dark mode not working

- Clear browser cookies and refresh
- Make sure theme-provider component is loaded

## Architecture

### Database Schema

```
profiles (User Profiles)
├── id (UUID, PK, references auth.users)
├── email (TEXT, not null)
├── role (TEXT, not null, default 'sender')
├── status (TEXT, not null, default 'pending')
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)

category_types (Global Types)
├── id (UUID, PK)
├── name (TEXT, not null, unique)
├── created_at (TIMESTAMPTZ)

categories (Income/Expense Categories)
├── id (UUID, PK)
├── name (TEXT, not null)
├── type (TEXT, check: income | expense)
├── type_id (UUID, FK → category_types)
├── color (TEXT, default '#3b82f6')
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)

transactions (Financial Transactions)
├── id (UUID, PK)
├── sender_id (UUID, not null, FK → profiles)
├── receiver_id (UUID, not null, FK → profiles)
├── amount (DECIMAL(12,2), not null, check: > 0)
├── category_id (UUID, FK → categories)
├── type (TEXT, check: income | expense)
├── description (TEXT)
├── date (DATE, not null)
├── created_at (TIMESTAMPTZ)
├── updated_at (TIMESTAMPTZ)
```

### Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui in `components/shadcn/`
- **Layout Components**: in `components/layouts/`
- **Context Providers**: in `components/providers/`
- **Configuration**: in `config/` (env, routes, site, navigation)
- **Charts**: Recharts
- **Styling**: Tailwind CSS v4
- **Date Handling**: date-fns

### Project Structure

```
components/
├── pages/               # Page components (HomePage, auth/*, dashboard/*)
├── layouts/             # Layout components
├── providers/           # React context providers
└── ui/                  # Reusable UI components
config/                  # Centralized configuration
lib/
├── shadcn/              # shadcn/ui components
├── supabase/            # Supabase clients
├── require-auth.ts      # Server Action auth guards
└── with-timeout.ts      # Promise timeout helper
_specs/                  # Feature specs
_plans/                  # Implementation plans
app/                     # Next.js pages (thin re-exports)
hooks/                   # Custom hooks
scripts/                 # Database migrations
```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_REDIRECT_URL` (production redirect)
   - `DEV_SUPABASE_REDIRECT_URL` (optional, for local development)
4. Deploy

## Notes

- Free Supabase tier includes 500 MB database storage
- Row Level Security is intentionally disabled in this pet project; all authenticated users share the same data pool

## Support

For issues with:

- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **Next.js**: Check [Next.js Docs](https://nextjs.org/docs)
- **shadcn/ui**: Check [shadcn/ui Components](https://ui.shadcn.com)
