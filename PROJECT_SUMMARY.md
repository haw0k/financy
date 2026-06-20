# Financy - Project Summary

## What Was Built

Complete full-stack financial management application with authentication, role-based access (sender/receiver/admin), registration approval, and comprehensive transaction/expense tracking.

## Server Actions Architecture

All database operations are performed through **Next.js Server Actions** in `app/actions/`:

| File              | Actions                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `auth.ts`         | login, signUp, adminLogin, adminSignUp, signOut                                                        |
| `admin.ts`        | getPendingUsers, approveUser, rejectUser                                                               |
| `categories.ts`   | getCategories, getCategoryTypes, createCategory, updateCategory, deleteCategory, + category types CRUD |
| `transactions.ts` | getTransactions, getReceivers, createTransaction, updateTransaction, deleteTransaction                 |
| `dashboard.ts`    | getDashboardData (transactions + stats)                                                                |

All actions use `requireAuth()` from `@/lib/require-auth` which returns `{ supabase, userId }`. Data actions (`categories.ts`, `transactions.ts`, `dashboard.ts`) use `requireApprovedUser()` so pending users and admin users are rejected at the action boundary.

**Benefits of this architecture:**

| Benefit                       | Description                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **No API boilerplate**        | No separate API routes needed — actions called directly from components          |
| **Automatic request context** | Actions have access to cookies, headers, session without prop drilling           |
| **Type safety end-to-end**    | Input/output types inferred; no manual serialization                             |
| **Progressive enhancement**   | Forms work without JavaScript                                                    |
| **Security by default**       | Actions run on server; sensitive logic never exposed to client                   |
| **Single DB connection**      | `requireAuth()` returns supabase client + userId, avoiding redundant connections |
| **Simplified data flow**      | No `useEffect` + `useState` for data fetching — call action directly             |

**Example pattern:**

```typescript
// Server Action
'use server'
import { requireAuth } from '@/lib/require-auth'

export async function createTransactionAction(input: TInput): Promise<TAuthResult> {
  const authResult = await requireAuth() // Single DB connection
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error }
  }

  const { error } = await authResult.supabase.from('transactions').insert({...})
  // ...
}
```

**Note:** Browser Supabase client was removed — all mutations go through Server Actions. The server client (`lib/supabase/server.ts`) is used exclusively.

## Project Structure

```
financy/
├── app/
│   ├── auth/
│   │   ├── login/               # Login page (email/password)
│   │   ├── sign-up/             # Sign up with role selection
│   │   ├── sign-up-success/     # Post-signup pending approval page
│   │   ├── admin/               # Admin signup/login page
│   │   ├── pending/             # Pending approval status page
│   │   ├── callback/            # OAuth callback handler
│   │   └── error/               # Auth error page
│   ├── (app)/
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard (pending user management)
│   │   │   └── layout.tsx       # Server-side admin authorization
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── transactions/    # Transactions management
│   │   │   ├── categories/    # Categories management
│   │   │   ├── settings/      # User settings & theme
│   │   │   └── layout.tsx     # Dashboard layout (nav + header)
│   │   └── layout.tsx         # App layout with AppShell
│   ├── (auth)/
│   │   └── auth/
│   │       ├── admin/           # Admin signup/login page
│   │       ├── login/           # Login page
│   │       ├── sign-up/         # Sign up with role selection
│   │       ├── sign-up-success/ # Post-signup pending approval page
│   │       ├── pending/         # Pending approval status page
│   │       ├── callback/        # OAuth callback handler
│   │       └── error/           # Auth error page
│   ├── api/
│   │   └── auth/
│   │       └── check-admin/       # GET check admin exists
│   ├── actions/                 # Server Actions (auth, admin, categories, transactions, dashboard)
│   ├── layout.tsx               # Root layout with ThemeProvider + RoleProvider
│   ├── page.tsx                 # Home page (redirects to auth)
│   ├── robots.ts                # Robots.txt (disallows /auth/admin)
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── pages/                   # Page components (HomePage, auth/*, dashboard/*, admin/*)
│   ├── layouts/                 # Layout components (DashboardNav, Header, MobileNav)
│   ├── providers/               # React context providers (ThemeProvider, MobileNavContext, RoleProvider)
│   └── ui/                      # Reusable UI components (PasswordField, DatePicker)
│
├── config/                      # Centralized configuration
│   ├── env.config.ts            # Typed environment variables
│   ├── routes.config.ts         # Route path constants
│   ├── site.config.ts           # Site metadata
│   └── navigation.config.ts     # Navigation item definitions
│
├── enums/                       # TypeScript enums
│   ├── role.enum.ts             # ERole (Sender, Receiver, Admin)
│   └── profile-status.enum.ts   # EProfileStatus (Pending, Approved)
│
├── interfaces/                  # TypeScript interfaces
│   ├── transactions.interface.ts
│   ├── categories.interface.ts
│   └── stats.interface.ts
│
├── hooks/                       # Custom hooks
│   ├── useMobile.ts
│   └── useHandler.ts
│
├── lib/
│   ├── shadcn/                  # shadcn/ui component library
│   ├── supabase/
│   │   ├── server.ts            # Server client
│   │   ├── middleware.ts        # Session + role middleware
│   │   └── admin.ts             # Service-role admin client
│   ├── db-errors.ts             # PostgreSQL error mapping
│   ├── require-auth.ts          # Shared auth guard for Server Actions
│   └── with-timeout.ts          # Promise timeout helper
│
├── _specs/                      # Feature specification documents
├── _plans/                      # Implementation plans
├── scripts/
│   ├── 001_init_database.sql    # Database initialization script
│   └── 002_add_role_to_jwt_metadata.sql # JWT role/status metadata triggers
│
├── tests/                       # Vitest test files
│
├── components.json              # shadcn/ui configuration
├── SETUP_GUIDE.md               # Detailed setup instructions
└── package.json                 # Dependencies
```

## Key Features Implemented

### Authentication & Authorization

- Email/Password registration and login
- Google OAuth (optional, can be configured)
- Email confirmation flow (Supabase built-in emails)
- Automatic profile creation on signup (database trigger)
- Session management with secure HTTP-only cookies
- Protected routes (dashboard and admin require authentication)
- Registration approval flow (admin must approve new users)

### Role System

- **Admin**: Exists **solely** to approve or reject pending user registrations. Signup sets the profile status to **pending**; the `handle_email_confirmation` trigger auto-approves the admin once their email is confirmed. **Only one admin is allowed** — enforced server-side by `adminSignUpAction` and a unique partial index at the database level.
- **Sender**: Can create transactions and track expenses. Can fully manage (CRUD) categories, category types, and transactions. No data ownership restrictions.
- **Receiver**: Can receive transactions and track income. Can fully manage (CRUD) categories, category types, and transactions. No data ownership restrictions.
- Role selection during signup
- Profile status tracking (pending/approved)
- No data ownership checks — all authenticated users share the same data pool

### Admin Features

- **Admin Auth Page** (`/auth/admin`): Signup for first admin, login for subsequent
- **Admin Dashboard** (`/admin`): View pending user registrations in a table
- **Approve/Reject**: `approveUserAction` confirms email and sets profile status to approved; `rejectUserAction` deletes user; both sanitize service-role client errors
- **Self-protection**: Admin cannot approve or reject their own account
- **Middleware protection**: Unauthorized users redirected away from admin routes

### Dashboard Features

1. **Overview Page**
   - Total balance summary
   - Income vs expense breakdown
   - Line chart (transactions over time)
   - Pie chart (expense categories distribution)

2. **Transactions Page**
   - Data table with all transactions
   - Filters (type, date range, category)
   - Sort by any column
   - Add new transaction form
   - Edit/delete transactions

3. **Categories Page**
   - View all categories
   - Create new categories
   - Edit category details
   - Delete categories
   - Separate income/expense categories

4. **Settings Page**
   - Dark/light mode toggle
   - Account information
   - Logout button

### Design

- Responsive layout (works on mobile, tablet, desktop)
- Dark/light mode with system preference detection
- Clean, professional UI using shadcn/ui components and sonner toast notifications
- Tailwind CSS for styling
- Accessible forms and navigation

### Security & Permissions Model (Pet Project Simplification)

**Row Level Security (RLS) is intentionally disabled** for simplicity. This is a pet project where data ownership checks are not implemented at the database level.

- **Single Admin Policy**: Only **one admin** is allowed. The `adminSignUpAction` server action validates that no approved admin exists before allowing signup.
- **Admin role**: Exists **solely** for approving or rejecting user registrations.
- **Sender/Receiver roles**: All authenticated users (regardless of role) can **create, read, update, and delete** categories, category types, and transactions. There are **no ownership checks** — any user can modify any record.
- Secure password hashing by Supabase
- Server Actions enforce approval status at the action boundary (not just middleware)
- CSRF protection via Next.js middleware
- Email verification and admin approval requirements
- Server-side admin layout guard (defense-in-depth)

## Technology Stack

| Layer              | Technology                       |
| ------------------ | -------------------------------- |
| **Frontend**       | Next.js 16 (App Router)          |
| **UI Framework**   | React 19                         |
| **Language**       | TypeScript                       |
| **Styling**        | Tailwind CSS v4                  |
| **UI Components**  | shadcn/ui                        |
| **Charts**         | Recharts                         |
| **Testing**        | Vitest (+ React Testing Library) |
| **Database**       | Supabase (PostgreSQL)            |
| **Authentication** | Supabase Auth                    |
| **Icons**          | lucide-react                     |
| **Toast**          | sonner                           |
| **Date Library**   | date-fns                         |
| **Deployment**     | Vercel                           |

Icons are from [Lucide](https://lucide.dev) — an open-source icon library with 1000+ SVG icons. Use the [icon search](https://lucide.dev/icons/) to visually browse and find icons by name.

## Database Schema

### profiles (User Profiles)

```sql
id (UUID) - references auth.users
email (TEXT)
role (sender | receiver | admin)
status (pending | approved)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### category_types (Category Types)

```sql
id (UUID)
name (TEXT) - unique
created_at (TIMESTAMPTZ)
```

### categories (Income/Expense Categories)

```sql
id (UUID)
name (TEXT)
type (income | expense)
type_id (UUID) - references category_types
color (TEXT) - default '#3b82f6'
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### transactions (Financial Transactions)

```sql
id (UUID)
amount (DECIMAL(12,2))
type (income | expense)
category_id (UUID) - references categories
sender_id (UUID) - references profiles
receiver_id (UUID) - references profiles
description (TEXT)
date (DATE)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

## Getting Started

1. **Setup Supabase**
   - Create project at supabase.com
   - Copy URL, Anon Key, and Service Role Key to `.env.local`

2. **Initialize Database**
   - Copy `scripts/001_init_database.sql` to Supabase SQL Editor
   - Run the script to create tables, triggers, and RLS policies

3. **Run Application**

   ```bash
   pnpm install
   pnpm dev
   ```

4. **Run Tests** (optional)

   ```bash
   pnpm test          # Watch mode
   pnpm test:run      # Single run
   ```

5. **Visit Application**
   - Open http://localhost:3000
   - Sign up for an account
   - Choose your role (sender or receiver)
   - Wait for admin approval (no email on signup)
   - Admin approves → receive confirmation email
   - Confirm email → access dashboard

## Cost Estimation (Free Tier)

- **Supabase**: Free tier includes 500 MB storage, perfect for MVP
- **Vercel**: Free hosting tier included
- **Total Cost**: $0 (completely free)

## Future Enhancements

- Real-time notifications
- Recurring transactions
- Budget tracking & alerts
- Export transactions (CSV/PDF)
- Advanced filtering & search
- Multi-currency support

## Notes

- All data is encrypted at rest and in transit
- No credit card required for free tier
- **RLS is disabled** — all authenticated users share the same data pool without ownership checks
- Application is designed as a pet project / educational project
- Can be easily extended with additional features (e.g., enable RLS, add ownership checks)
