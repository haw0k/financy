# Plan: Add Metadata to All Pages

branch: feat/add-metadata-to-all-pages

## Context

7 pages lack SEO metadata. All use thin re-exports (`export { default } from '@/...'`) of client components that cannot export metadata. Each needs to be restructured to a server component with `export const metadata`, following the login/signup page pattern.

## Pages to Update

All 7 follow the same pattern — replace the one-liner re-export with an import + metadata export.

| File                                  | Title                         | Description                                 |
| ------------------------------------- | ----------------------------- | ------------------------------------------- |
| `app/page.tsx`                        | Financy — Track Your Finances | Track your income and expenses with ease    |
| `app/auth/error/page.tsx`             | Error — Financy               | An error occurred during authentication     |
| `app/auth/sign-up-success/page.tsx`   | Check Your Email — Financy    | Verify your email to complete registration  |
| `app/dashboard/page.tsx`              | Dashboard — Financy           | View your financial overview and statistics |
| `app/dashboard/transactions/page.tsx` | Transactions — Financy        | Manage your financial transactions          |
| `app/dashboard/categories/page.tsx`   | Categories — Financy          | Organize your transactions by category      |
| `app/dashboard/settings/page.tsx`     | Settings — Financy            | Manage your account settings                |

## Pattern

Replace `export { default } from '@/...'` with:

```tsx
import XPage from '@/components/pages/...';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '... — Financy',
  description: '...',
};

export default XPage;
```

## Files Modified

- `app/page.tsx`
- `app/auth/error/page.tsx`
- `app/auth/sign-up-success/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/transactions/page.tsx`
- `app/dashboard/categories/page.tsx`
- `app/dashboard/settings/page.tsx`

## Verification

1. `pnpm dev` → navigate to each route, browser tab title is correct
2. Check `<meta name="description">` in page source
3. `pnpm lint && pnpm build`
