# Plan: perf: Simple Backend Query Caching

## Spec

Link: [Simple Backend Query Caching](_specs/2026-06-27-simple-backend-query-caching.md)

## Current State

The application uses Next.js 16 Server Actions in `app/actions/` to read from and write to Supabase. Dashboard pages fetch categories, transactions, category types, and dashboard statistics on every navigation, while the `/admin` page fetches pending users. There is no server-side caching layer yet, so repeated dashboard page transitions issue the same Supabase queries repeatedly. The project is already on Next.js 16, which supports the `"use cache"` directive, and the codebase follows a centralized config pattern under `config/`.

## Implementation Steps

### Phase 1 — Audit and Conventions

- [ ] Identify all read-heavy data functions in `app/actions/categories.ts`, `app/actions/transactions.ts`, and `app/actions/dashboard.ts`. Skip `app/actions/admin.ts` entirely because `/admin` requests must not be cached.
- [ ] Decide which queries are safe to cache and which must stay dynamic. Auth, session, role-sensitive, and all admin paths remain uncached.
- [ ] Create a centralized cache-tag registry in `config/cache.config.ts` that exports stable tag names for each data domain (categories, category types, transactions, dashboard stats). Co-located helper functions may re-export these tags.
- [ ] Define a single shared `cacheLife` profile in the registry to keep the implementation simple.

### Phase 2 — Wrap Read Functions

- [ ] Apply the `"use cache"` directive to the selected query functions.
- [ ] Import `cacheLife` and `cacheTag` from `next/cache` and the tag names from `config/cache.config.ts`.
- [ ] Ensure request-scoped cached functions use `connection()` from `next/server` when the result depends on the current request context.
- [ ] Keep function signatures stable so existing page components do not need to change their call sites.

### Phase 3 — Invalidate on Mutations

- [ ] Locate all relevant dashboard write actions (create/update/delete for transactions, categories, and category types). Skip approve/reject because `/admin` is not cached.
- [ ] Add `revalidateTag` calls after successful mutations, using the same tags defined in the registry.
- [ ] Verify that mutations return fresh data on the next page render without waiting for the TTL.

### Phase 4 — Safety and Edge Cases

- [ ] Confirm no authentication, authorization, or session functions are wrapped with `"use cache"`.
- [ ] Confirm user-scoped cached inputs do not leak data across accounts by passing stable scoped identifiers.
- [ ] Add minimal error handling so transient Supabase failures are not persisted in cache.

### Phase 5 — Verification and Documentation

- [ ] Run `pnpm build`, `pnpm type-check`, `pnpm lint`, and `pnpm test:run`.
- [ ] Manually navigate between `/dashboard`, `/dashboard/transactions`, and `/dashboard/categories` to confirm reduced Supabase queries. Verify that `/admin` still fetches fresh pending users on every visit.
- [ ] Add a dedicated "Caching" section to the project documentation (for example, in `docs/` or the main README) that explains: which dashboard data is cached, the shared TTL, the `cacheTag` names, how `revalidateTag` is triggered, and the explicit decision not to cache `/admin` queries.
- [ ] Remove temporary dev-only logging/metrics after the acceptance criteria are met.

## Risks & Notes

- Caching user-specific data incorrectly could expose one user's data to another. Scoped inputs and `connection()` must be reviewed carefully.
- Missing or misspelled `cacheTag` in write actions will leave stale data visible after mutations. The centralized registry reduces this risk.
- `"use cache"` replaces `unstable_cache` in Next.js 16; using both patterns together may cause confusion, so stick to one approach.
- Middleware still performs session/role checks, so cached reads must not bypass `requireApprovedUser` guards inside Server Actions.
- A single shared TTL keeps the implementation simple but may be slightly suboptimal for slowly changing data. This trade-off is intentional for this task.

## Definition of Done

- [ ] Read-heavy dashboard queries are cached with `"use cache"`, the shared `cacheLife`, and `cacheTag`. Admin queries remain uncached.
- [ ] `config/cache.config.ts` exports stable tag names and the shared TTL.
- [ ] Write actions call `revalidateTag` for the affected cache tags.
- [ ] No authentication, session, or authorization logic is cached.
- [ ] Repeated navigation between protected pages reduces Supabase read queries.
- [ ] `pnpm build`, `pnpm type-check`, `pnpm lint`, and `pnpm test:run` pass.
- [ ] A dedicated "Caching" section is added to the project documentation, covering cached domains, the shared TTL, tags, invalidation rules, and the intentional exclusion of `/admin` queries.
- [ ] Temporary dev-only logging/metrics are removed.
