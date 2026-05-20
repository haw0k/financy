# Plan: chore: Disable Row Level Security on User Tables

## Spec

Link: [Disable Row Level Security on User Tables](_specs/2026-05-20-disable-rls-on-user-tables.md)

## Context

The app currently uses Supabase Row Level Security (RLS) to isolate data per user — each user sees only their own transactions and profile. The requirement is to disable RLS on all user tables so that all authenticated users share a common pool of data (categories, transactions, profiles, category types). This is a fundamental shift from multi-tenant data isolation to shared single-tenant data.

## Current State

- **4 tables** have RLS enabled with per-user policies: `profiles`, `categories`, `category_types`, `transactions`
- `categories` and `category_types` already have broad policies (`auth.role() = 'authenticated'`) — effectively shared already
- `profiles` has user-isolation policies + admin bypass via `is_approved_admin()` helper
- `transactions` restricts by `sender_id` / `receiver_id`
- `get_user_stats(user_id)` SQL function filters by user — needs to become global
- App code filters transactions with `.or('sender_id.eq.${userId},receiver_id.eq.${userId}')` in `DashboardOverview.tsx` and `TransactionsTable.tsx`

## Implementation Steps

### Phase 1 — SQL Schema Changes

- [ ] **`scripts/001_init_database.sql`**: Change all 4 `ENABLE ROW LEVEL SECURITY` to `DISABLE ROW LEVEL SECURITY` (lines 17, 58, 84, 115)
- [ ] **`scripts/001_init_database.sql`**: Remove all `DROP POLICY` / `CREATE POLICY` blocks (~70 lines)
- [ ] **`scripts/001_init_database.sql`**: Remove `is_approved_admin()` function (was only used in admin policies)
- [ ] **`scripts/001_init_database.sql`**: Update `get_user_stats()` — remove `user_id uuid` parameter and `WHERE` clause, making it compute global stats

### Phase 2 — Application Code Changes

- [ ] **`components/layouts/DashboardOverview.tsx`**: Remove `.or()` filter from transactions query; change `get_user_stats` RPC call to no-args
- [ ] **`components/layouts/TransactionsTable.tsx`**: Remove `.or()` filter from transactions query

### Phase 3 — Tests & Verification

- [ ] Create **`tests/disable-rls-migration.test.ts`**: validate SQL file has `DISABLE ROW LEVEL SECURITY` on all 4 tables, no `CREATE POLICY` statements, no `is_approved_admin`, and `get_user_stats` has no `user_id` param
- [ ] Run `pnpm test:run` — all existing tests pass
- [ ] Run `pnpm lint && pnpm build` — no errors

## What Does NOT Change

- `hooks/useRole.ts`, `lib/supabase/middleware.ts`, admin layouts, `SettingsPage.tsx` — use `.eq('id', user.id).single()` to identify the CURRENT user, not to isolate data
- `TransactionForm.tsx` — `sender_id`/`receiver_id` are domain fields (who sent/received the money), not security boundaries
- Admin API routes — use `adminClient` for `auth.admin.*` operations, unrelated to table RLS
- `handle_new_user()` trigger — auto-creates profile on signup, independent of RLS

## Risks & Notes

- **Existing data duplicates**: if two users had separately created e.g. a "Groceries" category, both will now be visible — no deduplication is performed
- **Unused `userId` prop**: still passed to `DashboardOverview` and `TransactionsTable` but no longer consumed there — benign, clean up separately if desired
- **Existing databases**: the init script is for fresh setups; for an already-running project, run the `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` statements manually or via a migration file

## Definition of Done

- [ ] RLS disabled on all 4 tables in `scripts/001_init_database.sql`
- [ ] All policy definitions removed from the init script
- [ ] `get_user_stats()` works globally without user filtering
- [ ] Transactions are fetched without per-user filtering in the app code
- [ ] `pnpm lint && pnpm build` passes
- [ ] `pnpm test:run` passes
