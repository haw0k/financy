# Spec for Simple Backend Query Caching

branch: perf/simple-backend-query-caching

## Summary

Introduce lightweight server-side caching for read-heavy backend queries so that navigating between pages in the application does not repeatedly hit the database for the same data. Use the Next.js 16 `"use cache"` directive to cache asynchronous data-fetching functions, and pair it with `cacheLife` and `cacheTag` from `next/cache` to control cache freshness and invalidation. The goal is a measurable reduction in redundant Supabase queries during normal page transitions while keeping the implementation simple and easy to reason about.

## Functional Requirements

- Identify the read-heavy data access paths used by the dashboard pages (for example: category lists, transaction lists, category type lists, and dashboard statistics). The `/admin` page and its pending-user list must remain uncached.
- Wrap the selected backend query functions with the `"use cache"` directive so that the result can be reused across requests during a configured lifetime.
- Define sensible cache lifetimes via `cacheLife` for each cached data domain. Shared or slowly changing data can live longer; user-facing lists can live shorter.
- Tag cached results with `cacheTag` so that future mutations can invalidate the affected cache entries without waiting for the natural TTL expiration.
- Keep user-specific data safe by ensuring cached functions receive only stable, scoped inputs (for example, the current user id or organization context) and by using `connection()` from `next/server` where the cached value depends on request-time context.
- Do not cache authentication, authorization, session-sensitive, or admin operations. Rate-limiting, login, signup, admin approval actions, and the `/admin` pending-user list must remain uncached.
- Provide a clear invalidation strategy: identify which server actions should call `revalidateTag` after a successful mutation, and ensure the tag names are documented and stable.
- Add a single, small helper or convention for naming cache tags and lifetimes so that the pattern can be reused consistently across the codebase.
- Measure before and after by adding temporary logging or by verifying via the development indicators that repeated navigation between pages no longer re-executes the same Supabase query.

## Possible Edge Cases

- A cached function is called with a user id or session token that changes after login/logout; the cache key must reflect the scoped input so that users do not see each other's data.
- A mutation completes but the cache tag is misspelled or omitted, causing stale data to remain visible after a create/update/delete action.
- A cached value becomes stale mid-request because another user modified the shared data. The chosen TTL and explicit invalidation strategy must balance freshness with database load.
- The app contains both static and dynamic content on the same route. Using `"use cache"` must not accidentally turn dynamic, user-specific content into shared static output.
- Navigation between protected routes triggers middleware session refresh. Cached data must still respect role and approval status checks performed by middleware and by `requireApprovedUser`.
- A cached query fails due to a transient Supabase error. The cache should not retain the error result; error handling should either avoid caching or allow the next request to retry.

## Acceptance Criteria

- [x] The most frequently accessed read queries on `/dashboard`, `/dashboard/transactions`, and `/dashboard/categories` are wrapped with `"use cache"`. The `/admin` read queries are not cached.
- [x] Each cached function declares a `cacheLife` value and at least one `cacheTag`.
- [x] Relevant dashboard write actions (create/update/delete for transactions, categories, and category types) call `revalidateTag` for the affected tags. Admin approve/reject actions invalidate the `receivers` tag because the cached receiver list is affected by approval status.
- [x] Repeated navigation between the above pages does not produce new Supabase read queries for the cached data within the configured lifetime.
- [x] User-specific data is never returned to a different user after switching accounts or during concurrent sessions.
- [x] No authentication, session, or authorization-related functions are cached.
- [x] `pnpm build`, `pnpm type-check`, `pnpm lint`, and `pnpm test:run` pass.
- [x] A short note is added to the project documentation describing which data is cached, which data is intentionally not cached (`/admin`), how to invalidate the cached data, and the known limitation that transient read errors are cached for the configured lifetime.

## Open Questions

- Which specific pages or components currently cause the most redundant database round-trips? Should we prioritize the dashboard home statistics or the transactions list first? We shouldn't.
- What is an acceptable staleness window for each data domain? Should transactions and categories share a single short TTL, or be managed separately? Use a single TTL.
- Should we use a centralized cache-tag registry in `config/` or keep tag names co-located with their data functions? You decide.
- Do we want to keep the dev-only logging/metrics in place after the feature is merged, or remove it once acceptance criteria are met? You decide.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify that a cached dashboard data function returns the same result on repeated calls within its TTL without re-invoking the underlying Supabase query.
- Verify that calling a dashboard mutation action triggers `revalidateTag` with the expected tag and that a subsequent read returns fresh data.
- Verify that cached functions with user-scoped inputs produce different results for different mocked user contexts.
- Verify that authentication, approval, and `/admin` server actions do not contain the `"use cache"` directive.
