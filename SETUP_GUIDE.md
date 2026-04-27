# Finance Tracker - Setup Guide

## Prerequisites

- Supabase project (Free tier is sufficient)
- Node.js 18+ and pnpm installed

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Copy your **Project URL** and **Anon Key** from the API settings

### 1.2 Set Environment Variables

Create or update `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

For local development, you can optionally set a redirect URL override:

```bash
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from your Supabase project.

## Step 2: Initialize the Database

### 2.1 Run SQL Migration

1. Go to your Supabase project dashboard
2. Open **SQL Editor** from the left sidebar
3. Create a new query and copy-paste the entire content from `scripts/001_init_database.sql`
4. Click "Run" to execute the script

This will create:

- `profiles` table (users with roles: sender/receiver)
- `categories` table (income/expense categories)
- `transactions` table (payment transactions)
- Row Level Security (RLS) policies for data protection

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

- **Row Level Security (RLS)**: Users can only see their own data
- **Authentication Required**: All dashboard routes are protected
- **Password Hashing**: Passwords are securely hashed by Supabase

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
└── supabase/            # Supabase clients
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
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (optional, for custom redirect)
4. Deploy

## Notes

- Free Supabase tier includes 500 MB database storage
- Rate limiting is applied by default
- Transactions are soft-deletable (marked as deleted, not removed)
- All transactions are filtered by user (RLS)

## Support

For issues with:

- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **Next.js**: Check [Next.js Docs](https://nextjs.org/docs)
- **shadcn/ui**: Check [shadcn/ui Components](https://ui.shadcn.com)
