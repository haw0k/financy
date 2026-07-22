# Plan: Improve Server Components Error UX

Spec: { 2026-07-22-improve-server-components-error-ux.md }

## Goal
Replace `throw new Error(...)` in React Server Components with inline, user-facing error states so users see clear, actionable feedback instead of a generic Next.js error boundary.

## Affected files
- `components/pages/dashboard/DashboardPage.tsx`
- `components/layouts/TransactionsTableServer.tsx`
- `components/layouts/CategoriesTableServer.tsx`
- `components/pages/dashboard/SettingsPage.tsx`

## Steps

### 1. Create reusable ErrorState component
- Add `components/ui/ErrorState.tsx`.
- Mark as `'use client'` so it can call `useRouter().refresh()`.
- Use `Alert`, `AlertTitle`, `AlertDescription` from `@/lib/shadcn` with `variant="destructive"`.
- Add `AlertCircle` icon from `lucide-react`.
- Props: `title`, `description`, `retry`, `className`.
- Retry button uses `router.refresh()` to re-render Server Components without a full page reload.

### 2. Update DashboardPage
- Import `ErrorState`.
- When `getDashboardDataAction` returns `isSuccess: false`, render `ErrorState` inside `div className="p-6 md:p-8"` instead of `throw new Error(result.error)`.

### 3. Update TransactionsTableServer
- Import `ErrorState`.
- When `getTransactionsDataAction` fails, render `ErrorState` with title "Failed to load transactions".
- When `getCurrenciesAction` fails, render `ErrorState` with title "Failed to load currencies".
- Render order: transactions error first, currencies error second.

### 4. Update CategoriesTableServer
- Import `ErrorState`.
- When `getCategoriesDataAction` fails, render `ErrorState` with title "Failed to load categories" instead of throwing.

### 5. Harden SettingsPage
- Import `ErrorState` and `mapSupabaseError`.
- If `auth.getUser()` returns an error, render `ErrorState` with title "Failed to load account".
- If `profiles` query returns an error, render `ErrorState` with title "Failed to load profile".
- Keep existing redirect behavior for `requireApprovedUser()` failures.

### 6. Tests
- `tests/error-state.test.tsx` — render default/custom title and description, assert retry button calls `router.refresh()`.
- `tests/dashboard-page.test.tsx` — mock `getDashboardDataAction` success/error; assert `DashboardOverview` or `ErrorState` renders.
- `tests/transactions-table-server.test.tsx` — mock both actions with success/failure combinations; assert correct `ErrorState`.
- `tests/categories-table-server.test.tsx` — mock `getCategoriesDataAction` success/error; assert `CategoriesTableClient` or `ErrorState` renders.

### 7. Quality checks
- Run `pnpm format:fix`.
- Run `pnpm check` (Biome lint/format/import order).
- Run `pnpm type-check`.
- Run `pnpm test:run`.

### 8. Documentation
- Mark spec as completed in `_specs/_description.md`.
- Add plan entry to `_plans/_description.md` and mark as completed.

## Status
- [x] Completed.
