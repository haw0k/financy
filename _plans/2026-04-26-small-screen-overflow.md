# Plan for Fix Horizontal Scroll On Small Screens

Spec: `_specs/2026-04-26-small-screen-overflow.md`
Branch: `fix/small-screen-overflow`

## Context

**Firefox-specific issue.** At 320-350px viewport width in Firefox, a horizontal scrollbar appears on `/dashboard/*` pages. Unlike Chrome, Firefox does not shrink flex items below their `min-content` width. The card headers using `flex items-center justify-between` — title + description on the left and action button ("Add Transaction" / "Add Category") on the right — don't fit side by side at 320-350px, causing the `<main>` content to overflow horizontally.

## Changes

### 1. Fix Card header in TransactionsTable

**File: [components/layout/TransactionsTable.tsx](../components/layout/TransactionsTable.tsx)**

Line 119: change `flex items-center justify-between` to `flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between`

### 2. Fix Card headers in CategoriesTable

**File: [components/layout/CategoriesTable.tsx](../components/layout/CategoriesTable.tsx)**

Lines 178 and 386: same change — both the Categories card header and the Category Types card header.

No changes needed for DashboardPage or SettingsPage (simple stacked content that fits).

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- Open Firefox DevTools at 320px width on `/dashboard/transactions` and `/dashboard/categories` — no horizontal scrollbar
- Same check at 350px width
- At ≥640px (`sm:`), headers return to horizontal layout
