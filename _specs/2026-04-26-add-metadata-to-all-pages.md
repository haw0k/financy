# Spec for Add Metadata to All Pages

branch: feat/add-metadata-to-all-pages

## Summary

Add page-specific SEO metadata (title and description) to all pages that currently lack it. Only 3 pages currently have metadata: root layout, login, and signup. The remaining 7 pages (home, auth error, signup success, dashboard, transactions, categories, settings) need their own `<title>` and `<meta name="description">` tags.

## Pages Missing Metadata

| Route                     | Current page.tsx                                                          |
| ------------------------- | ------------------------------------------------------------------------- |
| `/` (Home)                | `export { default } from '@/components/pages/HomePage'`                   |
| `/auth/error`             | `export { default } from '@/components/pages/auth/ErrorPage'`             |
| `/auth/sign-up-success`   | `export { default } from '@/components/pages/auth/SignUpSuccessPage'`     |
| `/dashboard`              | `export { default } from '@/components/pages/dashboard/DashboardPage'`    |
| `/dashboard/transactions` | `export { default } from '@/components/pages/dashboard/TransactionsPage'` |
| `/dashboard/categories`   | `export { default } from '@/components/pages/dashboard/CategoriesPage'`   |
| `/dashboard/settings`     | `export { default } from '@/components/pages/dashboard/SettingsPage'`     |

## Functional Requirements

- Each page must have a unique `<title>` tag, using the pattern `"<Page Name> — Financy"`
- Each page must have a unique `<meta name="description">` describing the page content
- The root layout metadata (`title: "Finance Tracker"`) should remain as the default fallback
- All page.tsx files are currently thin re-exports from client components and must be restructured (same pattern as login/signup pages) to support metadata export
- Dashboard pages are protected by middleware — their metadata should still be set for SEO/social sharing purposes

## Page Metadata Table

| Page                      | Title                           | Description                                   |
| ------------------------- | ------------------------------- | --------------------------------------------- |
| `/`                       | `Financy — Track Your Finances` | `Track your income and expenses with ease`    |
| `/auth/error`             | `Error — Financy`               | `An error occurred during authentication`     |
| `/auth/sign-up-success`   | `Check Your Email — Financy`    | `Verify your email to complete registration`  |
| `/dashboard`              | `Dashboard — Financy`           | `View your financial overview and statistics` |
| `/dashboard/transactions` | `Transactions — Financy`        | `Manage your financial transactions`          |
| `/dashboard/categories`   | `Categories — Financy`          | `Organize your transactions by category`      |
| `/dashboard/settings`     | `Settings — Financy`            | `Manage your account settings`                |

## Possible Edge Cases

- Dashboard pages require authentication — metadata is still set for bookmark/social preview contexts
- Auth pages (error, sign-up-success) may be reached without being logged in — metadata should be appropriate
- The root layout `title` serves as a template or fallback — each page's metadata overrides it
- If a page component re-export is restructured incorrectly, the page may fail to render

## Acceptance Criteria

- All 7 pages listed above have distinct `<title>` tags
- All 7 pages have appropriate `<meta name="description">` tags
- Existing pages (login, signup, root layout) remain unchanged
- All pages continue to render correctly
- Build passes without errors

## Open Questions

- None

## Testing Guidelines

- N/A — metadata changes are not easily testable with Vitest
- Verify via `pnpm build` — page generation succeeds without errors
- Verify manually by navigating to each route and checking the browser tab title
