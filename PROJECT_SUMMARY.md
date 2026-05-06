# Financy - Project Summary

## What Was Built

Complete full-stack financial management application with authentication, role-based access (sender/receiver/admin), registration approval, and comprehensive transaction/expense tracking.

## Project Structure

```
finance-tracker/
├── app/
│   ├── auth/
│   │   ├── login/               # Login page (email/password)
│   │   ├── sign-up/             # Sign up with role selection
│   │   ├── sign-up-success/     # Post-signup pending approval page
│   │   ├── admin/               # Admin signup/login page
│   │   ├── pending/             # Pending approval status page
│   │   ├── callback/            # OAuth callback handler
│   │   └── error/               # Auth error page
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard (user management)
│   │   └── layout.tsx           # Server-side admin authorization
│   ├── api/
│   │   └── admin/
│   │       ├── pending-users/           # GET pending users
│   │       ├── pending-users/approve/   # POST approve user
│   │       ├── pending-users/reject/    # POST reject user
│   │       └── auth/check-admin/       # GET check admin exists
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── transactions/        # Transactions management
│   │   ├── categories/          # Categories management
│   │   ├── settings/            # User settings & theme
│   │   └── layout.tsx           # Dashboard layout (nav + header)
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Home page (redirects to auth)
│   ├── robots.ts                # Robots.txt (disallows /auth/admin)
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── pages/                   # Page components (HomePage, auth/*, dashboard/*, admin/*)
│   ├── layouts/                 # Layout components (DashboardNav, Header, MobileNav)
│   ├── providers/               # React context providers (ThemeProvider, MobileNavContext)
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
│   ├── useRole.ts               # Fetch current user role and status
│   ├── useToast.ts
│   ├── useMobile.ts
│   └── useHandler.ts
│
├── lib/
│   ├── shadcn/                  # shadcn/ui component library
│   └── supabase/
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server client
│       ├── middleware.ts        # Session + role middleware
│       └── admin.ts             # Service-role admin client
│
├── _specs/                      # Feature specification documents
├── _plans/                      # Implementation plans
├── scripts/
│   └── 001_init_database.sql    # Database initialization script
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

- **Sender**: Can create transactions (send money) and track expenses
- **Receiver**: Can receive money and track income
- **Admin**: Manages user registrations (approve/reject), auto-approved on first signup
- Role selection during signup
- Profile status tracking (pending/approved)
- Role-specific data filtering (RLS policies)
- Admin RLS: approved admins can view and update all profiles

### Admin Features

- **Admin Auth Page** (`/auth/admin`): Signup for first admin, login for subsequent
- **Admin Dashboard** (`/admin`): View pending user registrations in a table
- **Approve/Reject**: Approve sends Supabase confirmation email; reject deletes user
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
- Clean, professional UI using shadcn/ui components
- Tailwind CSS for styling
- Accessible forms and navigation

### Security Features

- Row Level Security (RLS) - users can only access their own data
- Admin RLS policies for authorized access
- Secure password hashing by Supabase
- Protected API routes with auth and role checks
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
| **Date Library**   | date-fns                         |
| **Deployment**     | Vercel                           |

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
- All transactions are user-owned (RLS policies ensure privacy)
- Application is production-ready but designed as educational project
- Can be easily extended with additional features
