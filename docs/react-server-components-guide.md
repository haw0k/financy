# React Server Components in Practice — Financy Architecture Guide

This guide explains how Financy uses **React Server Components (RSC)** inside a full-stack Next.js application that has authentication and a relational PostgreSQL database managed by Supabase.

It is not a general RSC tutorial. Instead, it shows the concrete patterns that already exist in the codebase: how pages fetch data, where mutations live, how auth guards are shared between Server Components and Server Actions, and when Client Components are still necessary.

## Table of Contents

1. [Why Server Components here](#why-server-components-here)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [The thin-route pattern](#the-thin-route-pattern)
4. [Fetching data directly from PostgreSQL](#fetching-data-directly-from-postgresql)
5. [Mutations through Server Actions](#mutations-through-server-actions)
6. [Authentication inside RSC](#authentication-inside-rsc)
7. [Client Components: when and why](#client-components-when-and-why)
8. [Decision matrix](#decision-matrix)
9. [Trade-offs and intentional simplifications](#trade-offs-and-intentional-simplifications)
10. [Summary](#summary)
11. [Caching with "use cache"](#caching-with-use-cache)
12. [Further reading](#further-reading)

## Why Server Components here

Before migrating to Server Actions, the auth forms used the **browser Supabase client**: `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()` ran directly in the browser. Every other data operation already happened on the server. That split created two problems:

- **Split mental model**: some mutations were API calls, others were Server Actions.
- **Security surface**: auth tokens and session cookies were handled closer to the client than necessary.

Moving auth and all data access to the server unified the model:

- Pages render on the server and can read the database before React reaches the browser.
- Mutations are plain async functions marked with `'use server'`; they run only on the server.
- The browser Supabase client was removed entirely.

The result is a smaller bundle, fewer client-side waterfalls, and one consistent place (`lib/require-auth.ts`) where authentication is enforced.

## Architecture at a glance

```
Browser
   │
   │  HTML + partial hydration
   ▼
Next.js App Router
   │
   ├── Server Components (pages + layouts)
   │      └── fetch data via lib/supabase/server.ts
   │
   ├── Server Actions (app/actions/*.ts)
   │      └── mutate data, validate auth
   │
   └── Client Components (forms, interactive UI)
          └── call Server Actions, not Supabase client

Server Components / Actions
   │
   ▼
lib/require-auth.ts  →  createClient()  →  Supabase Auth + PostgreSQL
```

Three rules define the boundary:

1. **Pages and layouts are Server Components by default.** They fetch data and pass it down as props.
2. **Mutations go through Server Actions.** Client Components never talk to Supabase directly.
3. **Auth guards are shared.** `requireAuth`, `requireApprovedUser`, and `requireApprovedAdmin` are used by both Server Components and Server Actions.

## The thin-route pattern

In `app/(app)/dashboard/page.tsx` the route file does almost nothing except export metadata and delegate to a page component:

```tsx
// app/(app)/dashboard/page.tsx
import { DashboardPage } from '@/components/pages/dashboard';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Dashboard — ${siteConfig.name}`,
  description: 'View your financial overview and statistics',
};

export default DashboardPage;
```

The route stays thin because the real page logic lives in `components/pages/dashboard/DashboardPage.tsx`, which is an **async Server Component**:

```tsx
// components/pages/dashboard/DashboardPage.tsx
import { createClient } from '@/lib/supabase/server';
import { DashboardOverview } from '@/components/layouts';
import { getDashboardDataAction } from '@/app/actions/dashboard';

export async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getDashboardDataAction();

  if (!result.isSuccess) {
    throw new Error(result.error);
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
      </div>
      <DashboardOverview
        transactions={result.data.transactions}
        stats={result.data.stats}
        statsError={result.data.statsError}
      />
    </div>
  );
}
```

Benefits of this split:

- `page.tsx` owns Next.js-specific concerns: metadata, route exports, revalidation config.
- The page component owns the data query and the JSX that depends on it.
- Both files are Server Components, so no client bundle is added for the initial render.

## Fetching data directly from PostgreSQL

Server Components can query the database directly because they run on the server. The dashboard page does not need a `useEffect` + `useState` dance; it awaits an async Server Action:

```ts
// app/actions/dashboard.ts
'use server';

import type { ITransaction } from '@/interfaces';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';
import type { TActionResult } from '@/types';

export async function getDashboardDataAction(): Promise<
  TActionResult<{
    transactions: ITransaction[];
    stats: { total_balance: number; total_income: number; total_expense: number } | null;
    statsError?: string;
  }>
> {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    return { isSuccess: false, error: authResult.error };
  }

  const [transactionsResult, statsResult] = await Promise.all([
    authResult.supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(10),
    authResult.supabase.rpc('get_user_stats'),
  ]);

  if (transactionsResult.error) {
    return { isSuccess: false, error: mapSupabaseError(transactionsResult.error) };
  }

  // ...assemble result
}
```

Key points:

- The action calls `requireApprovedUser()` first. Pending users and admin users are rejected **at the action boundary**, even if they call the generated action endpoint directly.
- It uses the server-side Supabase client returned by the guard, not a global client.
- Parallel SQL queries run with `Promise.all` because the database connection is already on the server.

## Mutations through Server Actions

All mutations — auth, categories, transactions, admin approvals — are Server Actions. The login form shows the typical shape:

```tsx
// components/pages/auth/LoginPage.tsx
'use client';

import { useState, useTransition, type SubmitEvent } from 'react';
import { Button, Input, Label } from '@/lib/shadcn';
import { showError, PasswordField } from '@/components/ui';
import { routes } from '@/config';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { loginAction } from '@/app/actions/auth';
import { withTimeout } from '@/lib/with-timeout';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await withTimeout(loginAction({ email, password }));
        if (!result.isSuccess && result.error) {
          showError('Login', result.error);
        }
      } catch (error) {
        if (isRedirectError(error)) throw error;
        showError('Login', 'Request timed out');
      }
    });
  };

  // ...form JSX
}
```

The corresponding action:

```ts
// app/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { routes } from '@/config';
import { loginSchema } from '@/schemas';
import type { TLoginInput } from '@/schemas';
import type { TAuthResult } from '@/types';
import { AUTH_MSGS } from '@/messages';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(credentials: TLoginInput): Promise<TAuthResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { isSuccess: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { isSuccess: false, error: error.message || AUTH_MSGS.AUTH_FAILED };
  }

  redirect(routes.dashboard);
}
```

Notice:

- The Client Component is only responsible for **local UI state** (inputs, pending state, error toasts).
- The Server Action owns **validation, auth, and redirects**.
- `redirect()` throws `NEXT_REDIRECT`, so the client-side `try/catch` rethrows it instead of swallowing it as an error.

## Authentication inside RSC

Authentication is not a Client Component concern in this project. The root layout is an async Server Component that reads the session and passes the user's role/status to a context provider:

```tsx
// app/layout.tsx (simplified)
import { RoleProvider } from '@/components/providers';
import { createClient } from '@/lib/supabase/server';

async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Prefer role/status from JWT app_metadata (set by DB trigger).
  // Fall back to profiles table if metadata is missing.
  // ...
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { role, status, isError } = await getProfile();

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <RoleProvider role={role} status={status} isError={isError}>
            {children}
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Route-level authorization is also a Server Component responsibility. The admin page route uses `requireApprovedAdmin()` and redirects unqualified users before any admin UI is rendered:

```tsx
// app/(app)/admin/page.tsx
import { redirect } from 'next/navigation';
import { AdminPage } from '@/components/pages/admin';
import { requireApprovedAdmin } from '@/lib/require-auth';
import { routes } from '@/config';

export default async function AdminPageRoute() {
  const adminResult = await requireApprovedAdmin();

  if ('error' in adminResult) {
    redirect(routes.pending);
  }

  return <AdminPage />;
}
```

The shared guard in `lib/require-auth.ts` is the single source of truth:

```ts
// lib/require-auth.ts (simplified)
import { createClient } from '@/lib/supabase/server';
import { ERole, EProfileStatus } from '@/enums';

export async function requireApprovedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: AUTH_MSGS.AUTH_FAILED };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.status !== EProfileStatus.Approved) {
    return { error: AUTH_MSGS.PENDING_APPROVAL_REQUIRED };
  }

  if (profile.role === ERole.Admin) {
    return { error: AUTH_MSGS.ADMIN_ACCESS_DENIED };
  }

  return { supabase, userId: user.id };
}
```

Because the same guard runs in both Server Components and Server Actions, the authorization logic does not diverge between "page load" and "mutation" paths.

## Client Components: when and why

Server Components are the default. A component becomes a Client Component only when it needs one of these:

- **Browser events**: `onSubmit`, `onClick`, `onChange`.
- **React hooks that need the DOM or browser APIs**: `useState`, `useEffect`, `useTransition`.
- **Client-side navigation feedback**: `useRouter`, `useSearchParams`.
- **Third-party interactive widgets**: charts with hover handlers, date pickers.

In Financy, Client Components are thin shells around interactivity:

- `LoginPage`, `SignUpPage`, `AdminAuthPage` — forms and submission state.
- `TransactionsTableClient` — client-side sorting/filtering of data that was already fetched on the server.
- `ThemeSelect` — theme switching.
- `DashboardOverview` child chart components — rendered inside a Server Component but may delegate to interactive Recharts wrappers.

The rule of thumb: if a component does not need browser APIs, keep it a Server Component.

## Decision matrix

| Task                                                  | Use                                  | Example in Financy                                                            |
| ----------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Render a page that needs database data                | **Server Component**                 | `components/pages/dashboard/DashboardPage.tsx` fetches transactions and stats |
| Enforce auth before rendering a page                  | **Server Component guard**           | `app/(app)/admin/page.tsx` calls `requireApprovedAdmin()`                     |
| Read global config/session once per request           | **Server Component (layout)**        | `app/layout.tsx` reads profile and feeds `RoleProvider`                       |
| Handle form submission                                | **Client Component + Server Action** | `LoginPage` calls `loginAction`                                               |
| Validate input and mutate data                        | **Server Action**                    | `app/actions/auth.ts`, `app/actions/transactions.ts`                          |
| Reject unapproved users at the API boundary           | **Server Action guard**              | `requireApprovedUser()` in data actions                                       |
| Local UI state: loading, errors, controlled inputs    | **Client Component**                 | `useTransition`, `useState` in auth forms                                     |
| Client-side filtering/sorting of already-fetched data | **Client Component**                 | `TransactionsTableClient`                                                     |

## Trade-offs and intentional simplifications

### No browser Supabase client

Pros:

- All auth and data code is reviewable in one place (`app/actions/` and `lib/`).
- Session cookies are managed server-side.
- No token exposure to the client bundle.

Cons:

- Every mutation requires a network round-trip through the Server Action boundary, even for trivial updates.
- Optimistic UI updates must be handled explicitly by the Client Component.

### RLS is disabled

This is a pet-project simplification documented in `PROJECT_SUMMARY.md`. Access control is enforced by:

- Middleware (`lib/supabase/update-session.ts`) for route protection.
- Server Component guards for render-time checks.
- `requireApprovedUser()` / `requireApprovedAdmin()` for action boundaries.

In a production app with multi-tenant data, RLS should be enabled and the data model should include ownership columns.

### Server Components are not a silver bullet

Server Components reduce client JavaScript and eliminate `useEffect` waterfalls, but they also:

- Cannot use browser APIs or React hooks that depend on the DOM.
- Require careful error boundaries; an unhandled error during server render surfaces as a 500 page.
- Make some patterns (e.g., polling, real-time subscriptions) impossible without Client Components.

Financy uses Server Components for the initial data layer and Client Components for the thin interactive layer on top.

## Summary

Financy's architecture is built on three ideas:

1. **Server Components own data and auth checks.** Pages and layouts fetch from PostgreSQL before the browser loads.
2. **Server Actions own mutations.** Client Components call actions; actions validate, mutate, and redirect.
3. **Shared guards keep auth consistent.** `requireAuth`, `requireApprovedUser`, and `requireApprovedAdmin` run in both Server Components and Server Actions.

The result is a full-stack React application where most files are Server Components, only interactive surfaces are Client Components, and the Supabase client never runs in the browser.

## Further reading

- [Next.js Server Components documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Server Actions documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js `use cache` documentation](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- `PROJECT_SUMMARY.md` — Financy architecture overview
- `CLAUDE.md` — project conventions and commands

## Caching with `"use cache"`

Selected read operations are cached with Next.js 16 `"use cache"` to reduce redundant Supabase queries when users navigate between dashboard pages.

### What is cached

- Dashboard overview (`getDashboardDataAction`) — tagged `dashboard` + `transactions`.
- Transactions list (`getTransactionsDataAction`) — tagged `transactions`, `categories`, `categoryTypes`.
- Categories list (`getCategoriesDataAction`) — tagged `categories` + `categoryTypes`.
- Receiver dropdown (`getReceiversAction`) — tagged `receivers`.

All cached functions use `"use cache: private"` so the cache is per-user and never shared across sessions.

### Shared cache lifetime

A single profile is used for all dashboard caches (defined in `config/cache.config.ts`):

| Value        | Seconds |
| ------------ | ------- |
| `stale`      | 30      |
| `revalidate` | 30      |
| `expire`     | 60      |

### Cache invalidation

After a successful mutation the affected tags are revalidated with `revalidateTag(tag, mutationRevalidateProfile)`:

- `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction` → `categories`
- `createCategoryTypeAction`, `updateCategoryTypeAction`, `deleteCategoryTypeAction` → `categoryTypes`
- Transaction mutations (`createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction`) → `transactions` **and** `dashboard`
- Admin approval/rejection (`approveUserAction`, `rejectUserAction`) → `receivers`

### What is NOT cached

- Authentication, authorization, session, and admin flows are never cached.
- The `/admin` pending-users list remains uncached so the admin always sees fresh data.
- Any data operation that depends on real-time accuracy is left dynamic.

### Known limitations

- Cached functions return success/error results through `TActionResult`. A transient database or RPC error returned by a cached read will be cached for the configured lifetime, so the same user will see the stale error until the TTL expires or a successful revalidation occurs. For this reason the cache lifetime is intentionally short (30–60 seconds).

### Suspense boundaries

Because private caches read cookies/session data, auth-dependent layouts are wrapped in a shared `<AuthSuspense>` fallback (`components/layouts/AuthSuspense.tsx`) so the static shell can prerender while the session/role resolves at request time. Loading skeletons for individual dashboard routes live in `app/(app)/dashboard/**/loading.tsx` and render through Next.js's built-in loading convention.
