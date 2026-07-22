# Spec for Improve Server Components Error UX

branch: feature/improve-server-components-error-ux

## Summary

Replace unhandled `throw new Error(...)` inside React Server Components with meaningful inline error states. When a data-loading Server Action fails, the user should see a styled alert with a clear title, the user-facing error message, and an optional retry button instead of the generic Next.js error boundary page.

## Functional Requirements

- Add a reusable `ErrorState` UI component in `components/ui/ErrorState.tsx`.
- `ErrorState` must support:
  - A custom title.
  - A description (the error message).
  - An optional "Try again" button that calls `router.refresh()`.
- Update the following Server Components to render `ErrorState` when their Server Action returns `isSuccess: false`:
  - `components/pages/dashboard/DashboardPage.tsx` (failed `getDashboardDataAction`).
  - `components/layouts/TransactionsTableServer.tsx` (failed `getTransactionsDataAction` or `getCurrenciesAction`).
  - `components/layouts/CategoriesTableServer.tsx` (failed `getCategoriesDataAction`).
- Keep the same page layout padding (`p-6 md:p-8`) so the error state visually fits the surrounding page.
- Harden `components/pages/dashboard/SettingsPage.tsx` against unexpected Supabase errors by rendering `ErrorState` for `auth.getUser()` or `profiles` query failures.

## Possible Edge Cases

- Server Action returns an empty `error` string: still render the generic fallback description.
- User clicks retry while offline: `router.refresh()` will re-attempt and show the error again if it still fails.
- Multiple independent errors in `TransactionsTableServer` (e.g., transactions fail but currencies succeed): only show the first detected error.

## Acceptance Criteria

- No `throw new Error(...)` remains in the three data-loading Server Components for action-failure paths.
- `ErrorState` renders with `Alert` destructive styling and a Lucide alert icon.
- All existing tests continue to pass.
- New tests cover `ErrorState` rendering, retry behavior, and error-state rendering in `DashboardPage`, `TransactionsTableServer`, and `CategoriesTableServer`.
- `pnpm type-check`, `pnpm check`, and `pnpm test:run` pass without errors.

## Open Questions

- Should retry use `router.refresh()` or full page reload? Decision: `router.refresh()` to preserve scroll and theme state.
- Should `SettingsPage` Supabase errors be handled in this change? Decision: yes, render `ErrorState` for explicit query errors as a defensive UX improvement.

## Testing Guidelines

Create test files in `./tests`:

- `tests/error-state.test.tsx` — render with/without retry; simulate retry click and assert `router.refresh()` is called.
- `tests/dashboard-page.test.tsx` — mock `getDashboardDataAction` to return an error and assert `ErrorState` is rendered; mock success and assert `DashboardOverview` is rendered.
- `tests/transactions-table-server.test.tsx` — mock `getTransactionsDataAction` and `getCurrenciesAction` to return errors and assert the correct `ErrorState` is rendered for each.
- `tests/categories-table-server.test.tsx` — mock `getCategoriesDataAction` to return an error and assert `ErrorState` is rendered.
