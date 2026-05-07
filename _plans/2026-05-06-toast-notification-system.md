# Plan: Toast Notification System

## Context

Currently, all Supabase errors are silently swallowed with `console.error()` — users get no visual feedback. The project has `sonner` (v1.7.4) installed, with a ready-to-use shadcn wrapper at `lib/shadcn/Sonner.tsx` that's already in the barrel exports but never placed in the layout. The old Radix-based shadcn toast system (`Toast.tsx`, `Toaster.tsx`, `useToast.ts`) is completely unused dead code.

This plan: (a) removes the dead Radix toast code, (b) adds the Sonner `<Toaster>` to the root layout, (c) creates styled toast helpers with icons, and (d) creates a Supabase error interceptor.

## Files to Delete

| File                     | Reason                                                          |
| ------------------------ | --------------------------------------------------------------- |
| `hooks/useToast.ts`      | Dead code — only imported by `Toaster.tsx` which is also unused |
| `lib/shadcn/Toaster.tsx` | Dead code — not imported anywhere, not in layout                |
| `lib/shadcn/Toast.tsx`   | Dead code — Radix-based toast, no one imports it                |

## Files to Modify (barrel exports)

| File                  | Change                                                                 |
| --------------------- | ---------------------------------------------------------------------- |
| `hooks/index.ts`      | Remove `export * from './useToast'` line                               |
| `lib/shadcn/index.ts` | Remove `export * from './Toast'` and `export * from './Toaster'` lines |

## Files to Create

### 1. `components/ui/ToastNotification.tsx`

Helper functions that call sonner's `toast()` with JSX content (icon + message). Four variants:

| Export                  | Variant      | Background        | Text  | Icon (lucide-react) |
| ----------------------- | ------------ | ----------------- | ----- | ------------------- |
| `showError(msg)`        | Error        | `bg-red-600`      | white | `CircleX`           |
| `showWarning(msg)`      | Warning      | `bg-yellow-500`   | dark  | `TriangleAlert`     |
| `showSuccess(msg)`      | Success      | `bg-green-600`    | white | `CircleCheck`       |
| `showNotification(msg)` | Notification | `bg-white border` | dark  | `Info`              |

Each calls sonner's `toast(jsx, { classNames: {...} })` with appropriate styling and longer duration for errors.

### 2. `lib/handle-supabase-error.ts`

Utility `handleSupabaseError(error: unknown)`:

- Checks for `PostgrestError`-like shape (`error.code` + `error.message`)
- Maps known Postgres error codes to user-friendly Russian messages (e.g., `23505` — "Запись уже существует")
- Falls back to raw `error.message` for unknown codes
- Calls `showError()` from `components/ui/ToastNotification`
- Non-PostgresError: extracts message or shows fallback "Произошла ошибка"

## Files to Modify (wiring)

### 1. `app/layout.tsx`

Import `SonnerToaster` from `@/lib/shadcn` and place it inside `<ThemeProvider>`:

```tsx
import { SonnerToaster } from '@/lib/shadcn';
// inside ThemeProvider:
<SonnerToaster richColors position="bottom-right" expand closeButton />;
```

### 2. Components — replace `console.error` with `handleSupabaseError`

| File                                       | Catch blocks                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `components/layouts/TransactionForm.tsx`   | 2 (fetchUsers, handleSubmit)                                                             |
| `components/layouts/TransactionsTable.tsx` | 3 (transactions, categories, category_types)                                             |
| `components/layouts/CategoriesTable.tsx`   | 2 (categories, category_types)                                                           |
| `components/layouts/DashboardOverview.tsx` | 1 (stats/transactions)                                                                   |
| `components/pages/auth/LoginPage.tsx`      | 1 (login action)                                                                         |
| `components/pages/auth/SignUpPage.tsx`     | 1 (signup action)                                                                        |
| `components/pages/auth/AdminAuthPage.tsx`  | 2 (signup, login)                                                                        |
| `components/pages/admin/AdminPage.tsx`     | Replace `toast.error`/`toast.success` from sonner with `showError`/`showSuccess` helpers |

Pattern change for console.error:

```diff
- console.error('Error fetching transactions:', error);
+ handleSupabaseError(error);
```

Pattern change for AdminPage (already uses sonner toast, switch to styled helpers):

```diff
- import { toast } from 'sonner';
+ import { showError, showSuccess } from '@/components/ui';
- toast.error('Failed to fetch pending users');
+ showError('Failed to fetch pending users');
- toast.success('User approved');
+ showSuccess('User approved');
```

## Verification

1. `pnpm type-check` — no TS errors
2. `pnpm lint` — no lint errors
3. `pnpm dev` — manual smoke test:
   - Trigger error (e.g., duplicate category name) → red toast with `CircleX`
   - Use `showSuccess('Test')` in browser console → green toast with `CircleCheck`
   - Verify toasts auto-dismiss and closeable via X button
