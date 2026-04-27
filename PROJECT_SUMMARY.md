# Financy - Project Summary

## What Was Built

Complete full-stack financial management application with authentication, role-based access, and comprehensive transaction/expense tracking.

## Project Structure

```
finance-tracker/
├── app/
│   ├── auth/
│   │   ├── login/               # Login page (email/password)
│   │   ├── sign-up/             # Sign up with role selection
│   │   ├── callback/            # OAuth callback handler
│   │   └── error/               # Auth error page
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── transactions/        # Transactions management
│   │   ├── categories/          # Categories management
│   │   ├── settings/            # User settings & theme
│   │   └── layout.tsx           # Dashboard layout (nav + header)
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Home page (redirects to auth)
│   └── globals.css              # Global styles & design tokens
│
├── components/
│   ├── pages/                   # Page components (HomePage, auth/*, dashboard/*)
│   ├── layouts/                 # Layout components (DashboardNav, Header)
│   ├── providers/               # React context providers (ThemeProvider, MobileNavContext)
│   └── ui/                      # Reusable UI components (PasswordField, DatePicker)
│
├── config/                      # Centralized configuration
│   ├── env.config.ts            # Typed environment variables
│   ├── routes.config.ts         # Route path constants
│   ├── site.config.ts           # Site metadata
│   └── navigation.config.ts     # Navigation item definitions
│
├── lib/
│   ├── shadcn/                  # shadcn/ui component library
│   └── supabase/
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server client
│       └── middleware.ts        # Session management
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
- Email confirmation flow
- Automatic profile creation on signup
- Session management with secure HTTP-only cookies
- Protected routes (dashboard requires authentication)

### Role System

- **Sender**: Can create transactions (send money) and track expenses
- **Receiver**: Can receive money and track income
- Role selection during signup
- Role-specific data filtering (RLS policies)

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
- Secure password hashing by Supabase
- Protected API routes
- CSRF protection via Next.js middleware
- Email verification requirement

## Technology Stack

| Layer              | Technology              |
| ------------------ | ----------------------- |
| **Frontend**       | Next.js 16 (App Router) |
| **UI Framework**   | React 19                |
| **Language**       | TypeScript              |
| **Styling**        | Tailwind CSS v4         |
| **UI Components**  | shadcn/ui               |
| **Charts**         | Recharts                |
| **Testing**        | Vitest                  |
| **Database**       | Supabase (PostgreSQL)   |
| **Authentication** | Supabase Auth           |
| **Date Library**   | date-fns                |
| **Deployment**     | Vercel                  |

## Database Schema

### profiles (User Profiles)

```sql
id (UUID) - references auth.users
email (TEXT)
role (sender | receiver)
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
   - Copy URL and Anon Key to `.env.local`

2. **Initialize Database**
   - Copy `scripts/001_init_database.sql` to Supabase SQL Editor
   - Run the script to create tables and RLS policies

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
   - Confirm email
   - Access dashboard

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
