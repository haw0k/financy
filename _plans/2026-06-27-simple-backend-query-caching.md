# Plan: perf: Simple Backend Query Caching

## Spec

Link: [Simple Backend Query Caching](_specs/2026-06-27-simple-backend-query-caching.md)

## Current State

The application uses Next.js 16 Server Actions in `app/actions/` to read from and write to Supabase. Dashboard pages fetch categories, transactions, category types, and dashboard statistics on every navigation, while the `/admin` page fetches pending users. There is no server-side caching layer yet, so repeated dashboard page transitions issue the same Supabase queries repeatedly. The project is already on Next.js 16, which supports the `"use cache"` directive, and the codebase follows a centralized config pattern under `config/`.

## Implementation Steps

### Phase 1 — Audit and Conventions

- [x] Identify all read-heavy data functions in `app/actions/categories.ts`, `app/actions/transactions.ts`, and `app/actions/dashboard.ts`. Skip `app/actions/admin.ts` entirely because `/admin` requests must not be cached.
- [x] Decide which queries are safe to cache and which must stay dynamic. Auth, session, role-sensitive, and all admin paths remain uncached.
- [x] Create a centralized cache-tag registry in `config/cache.config.ts` that exports stable tag names for each data domain (categories, category types, transactions, dashboard stats, receivers). Co-located helper functions may re-export these tags.
- [x] Define a single shared `cacheLife` profile in the registry to keep the implementation simple.

### Phase 2 — Wrap Read Functions

- [x] Apply the `"use cache"` directive to the selected query functions.
- [x] Import `cacheLife` and `cacheTag` from `next/cache` and the tag names from `config/cache.config.ts`.
- [x] Use `"use cache: private"` so per-user data is scoped to the current session without manual `connection()` plumbing.
- [x] Keep function signatures stable so existing page components do not need to change their call sites.

### Phase 3 — Invalidate on Mutations

- [x] Locate all relevant dashboard write actions (create/update/delete for transactions, categories, and category types).
- [x] Also invalidate the `receivers` tag in admin approve/reject actions, because `getReceiversAction` is cached and the approved/rejected user affects the receiver dropdown.
- [x] Add `revalidateTag` calls after successful mutations, using the same tags defined in the registry and a shared `mutationRevalidateProfile`.
- [x] Verify that mutations return fresh data on the next page render without waiting for the TTL.

### Phase 4 — Safety and Edge Cases

- [x] Confirm no authentication, authorization, or session functions are wrapped with `"use cache"`.
- [x] Confirm user-scoped cached inputs do not leak data across accounts by using `"use cache: private"`.
- [x] Keep the shared TTL conservative (30–60 seconds) and document that transient Supabase failures returned by cached reads will be cached for that lifetime.

### Phase 5 — Verification and Documentation

- [x] Run `pnpm build`, `pnpm type-check`, `pnpm lint`, and `pnpm test:run`.
- [x] Add tests verifying that mutation actions call `revalidateTag` with the expected tags.
- [x] Add a dedicated "Caching" section to `docs/react-server-components-guide.md` that explains: which dashboard data is cached, the shared TTL, the `cacheTag` names, how `revalidateTag` is triggered, the explicit decision not to cache `/admin` queries, and the known limitation around cached error results.
- [x] No temporary dev-only logging/metrics were added.

## Risks & Notes

- Caching user-specific data incorrectly could expose one user's data to another. Scoped inputs and `connection()` must be reviewed carefully.
- Missing or misspelled `cacheTag` in write actions will leave stale data visible after mutations. The centralized registry reduces this risk.
- `"use cache"` replaces `unstable_cache` in Next.js 16; using both patterns together may cause confusion, so stick to one approach.
- Middleware still performs session/role checks, so cached reads must not bypass `requireApprovedUser` guards inside Server Actions.
- A single shared TTL keeps the implementation simple but may be slightly suboptimal for slowly changing data. This trade-off is intentional for this task.

## Definition of Done

- [x] Read-heavy dashboard queries are cached with `"use cache"`, the shared `cacheLife`, and `cacheTag`. Admin queries remain uncached.
- [x] `config/cache.config.ts` exports stable tag names, the shared TTL, and a shared mutation revalidation profile.
- [x] Write actions call `revalidateTag` for the affected cache tags.
- [x] No authentication, session, or authorization logic is cached.
- [x] Repeated navigation between protected pages reduces Supabase read queries.
- [x] `pnpm build`, `pnpm type-check`, `pnpm lint`, and `pnpm test:run` pass.
- [x] A dedicated "Caching" section is added to the project documentation, covering cached domains, the shared TTL, tags, invalidation rules, the intentional exclusion of `/admin` queries, and the known limitation around cached error results.
- [x] Temporary dev-only logging/metrics are removed.
