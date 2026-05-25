# Financy — Personal Finance Tracker

**Financy** is a personal and small-team finance tracker for managing income, expenses, and transactions. It supports role-based workflows — senders log expenses, receivers track income, and admins approve new registrations — so it works for individual budgeting, family accounting, or small groups that need to split and track money flows.

Built with Next.js 16, Supabase (PostgreSQL + Auth), and React 19. Features secure email/OAuth authentication, category management, interactive charts, and a dark/light theme.

> This project also serves as a testbed for spec-driven development workflows with AI coding assistants (Claude Code and OpenCode). See [_specs/](./_specs/) for feature specifications and implementation plans.

## Quick Start

### 1. Clone & Install

```bash
# Install dependencies
pnpm install
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL**, **Anon Key**, and **Service Role Key**
4. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Initialize Database

1. Open Supabase Dashboard → SQL Editor
2. Copy entire content from `scripts/001_init_database.sql`
3. Paste into SQL Editor and click "Run"

### 4. Run the App

```bash
pnpm dev
```

Visit `http://localhost:3000` and create your account!

## Features

✅ **Authentication**

- Email/Password signup
- Google OAuth support
- Email confirmation
- Secure session management
- Registration approval flow

✅ **Role-Based Access**

- Sender (send money, track expenses)
- Receiver (receive money, track income)
- Admin (manage user registrations, approve/reject)
- Role-specific dashboards and RLS policies

✅ **Admin Panel**

- Admin signup/login page (`/auth/admin`)
- Pending user management table
- Approve (triggers confirmation email) / Reject (deletes user)
- Self-protection against self-approve/reject
- Middleware-enforced access control

✅ **Financial Tracking**

- Transaction management
- Category organization
- Income/expense breakdown
- Visual charts & analytics

✅ **Dashboard**

- Overview with stats cards
- Transaction data tables
- Category management
- Dark/light mode toggle

✅ **Security**

- Row Level Security (RLS)
- Password hashing
- Protected routes
- User data isolation
- Server-side admin guards

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library
- **Dates**: date-fns

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture overview
- **[Naming Conventions](./docs/naming-conventions.md)** - Convention for naming React components, hooks, and TypeScript types
- **[Commit Message Convention](./docs/commit-message-convention.md)** - Commit message format and guidelines

## Project Structure

```
├── app/                  # Next.js pages (thin re-exports)
│   ├── auth/             # Authentication pages (/login, /sign-up, /admin, /pending)
│   ├── admin/            # Admin dashboard (/admin)
│   ├── api/              # API routes (/api/admin/*, /api/auth/*)
│   └── dashboard/        # Protected dashboard routes
├── components/
│   ├── pages/            # Page components (HomePage, auth/*, dashboard/*, admin/*)
│   ├── layouts/          # Layout components (DashboardNav, Header, MobileNav)
│   ├── providers/        # React context providers
│   └── ui/               # Reusable UI components
├── config/               # Centralized configuration
├── enums/                # TypeScript enums (ERole, EProfileStatus)
├── interfaces/           # TypeScript interfaces
├── hooks/                # Custom hooks (useRole, useToast, useMobile)
├── lib/
│   ├── shadcn/           # shadcn/ui component library
│   └── supabase/         # Supabase clients (client, server, middleware, admin)
├── _specs/               # Feature specs
├── _plans/               # Implementation plans
├── scripts/              # SQL migration scripts
├── tests/                # Vitest test files
├── components.json       # shadcn/ui configuration
```

## Database Schema

Four main tables with Row Level Security:

| Table            | Purpose                     | RLS                                          |
| ---------------- | --------------------------- | -------------------------------------------- |
| `profiles`       | User profiles, role, status | Users see own profile; admins see all        |
| `category_types` | Global category types       | All authenticated users                      |
| `categories`     | Income/expense categories   | All authenticated users                      |
| `transactions`   | Financial transactions      | Users see own transactions (sender/receiver) |

See `scripts/001_init_database.sql` for full schema with triggers and policies.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=                # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=           # Public anon key
SUPABASE_SERVICE_ROLE_KEY=               # Secret service_role key (admin API)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=   # Dev-only redirect override (optional)
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=       # Production redirect URL
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint and check types
pnpm lint

# Run tests
pnpm test          # Watch mode
pnpm test:run      # Single run
```

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import in Vercel
3. Add env variables (including `SUPABASE_SERVICE_ROLE_KEY`)
4. Deploy

## Cost

- **Supabase**: Free tier (500 MB storage)
- **Vercel**: Free tier
- **Total**: $0

## Troubleshooting

| Issue                 | Solution                             |
| --------------------- | ------------------------------------ |
| Auth error            | Check SQL script was run in Supabase |
| Missing tables        | Run the SQL migration script         |
| Dark mode not working | Clear cookies and refresh            |
| Email not confirmed   | Check Supabase Auth emails           |
| Admin access denied   | Verify admin is approved in profiles |

## Features Roadmap

- [ ] Budget tracking & alerts
- [ ] Recurring transactions
- [ ] Real-time notifications
- [ ] CSV/PDF export
- [ ] Multi-currency support

## License

MIT - Feel free to use for your projects

## Support

- **Supabase Issues**: [Supabase Docs](https://supabase.com/docs)
- **Next.js Issues**: [Next.js Docs](https://nextjs.org/docs)
- **UI Component Issues**: [shadcn/ui](https://ui.shadcn.com)
