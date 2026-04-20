# Finance Tracker

A modern, full-stack financial management application built with Next.js 16, Supabase, and React 19. Track income and expenses with role-based access, secure authentication, and beautiful visualizations.

## Quick Start

### 1. Clone & Install

```bash
# Install dependencies
pnpm install
```

### 2. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your **Project URL** and **Anon Key**
4. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
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

✅ **Role-Based Access**

- Sender (send money, track expenses)
- Receiver (receive money, track income)
- Role-specific dashboards

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

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Dates**: date-fns

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture overview
- **[Naming Conventions](./docs/naming-conventions.md)** - Convention for naming React components, hooks, and TypeScript types
- **[Commit Message Convention](./docs/commit-message-convention.md)** - Commit message format and guidelines
- **[Naming Conventions](./docs/naming-conventions.md)** - Convention for naming React components, hooks, and TypeScript types

## Project Structure

```
├── app/                    # Next.js pages (thin re-exports)
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard routes
├── components/
│   ├── pages/            # Page components (HomePage, auth/*, dashboard/*)
│   └── layout/           # Layout components
├── lib/
│   ├── shadcn/           # shadcn/ui component library
│   └── supabase/         # Supabase client & middleware
├── hooks/                 # Custom hooks
├── scripts/               # SQL migration scripts
└── middleware.ts          # Auth token refresh
```

## Database Schema

Three main tables with Row Level Security:

| Table          | Purpose                   | RLS                          |
| -------------- | ------------------------- | ---------------------------- |
| `profiles`     | User profiles with role   | ✓ Users see own profile      |
| `categories`   | Income/expense categories | ✓ Users see own categories   |
| `transactions` | Financial transactions    | ✓ Users see own transactions |

See [DATABASE.md](./scripts/001_init_database.sql) for full schema.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key
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
```

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import in Vercel
3. Add env variables
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

---

