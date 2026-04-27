# Spec for Extract Route Constants

branch: refactor/extract-route-constants

## Summary

Extract all hardcoded route path strings (e.g. `'/dashboard'`, `'/dashboard/transactions'`, `'/auth/login'`) scattered across the codebase into a single `config/routes.config.ts` file. This eliminates duplication, prevents typos, and makes route changes easier in the future.

## Functional Requirements

- Create `config/routes.config.ts` with named exports for every unique route path used in the application
- Export a barrel re-export from `config/index.ts` (or add to it if it already exists)
- Replace all hardcoded route strings throughout the codebase with imports from the new config
- Cover all route categories: dashboard pages, auth pages, root/home, and any API or callback routes

## Possible Edge Cases

- Dynamic route segments (e.g. transaction IDs) — these should use a route factory function or template string rather than a static constant
- Absolute vs relative URLs (e.g. for OAuth callbacks) — ensure the config covers the path portion
- `usePathname()` comparisons for active link detection — these compare against the same path strings and should use the constants

## Acceptance Criteria

- `config/routes.config.ts` exists and exports all route constants
- No hardcoded route path strings remain in component files, page files, or hook files
- `config/index.ts` re-exports the route constants
- All existing navigation and routing behavior is preserved
- `pnpm type-check` and `pnpm lint` pass without errors

## Open Questions

- Should constants use a naming convention like `ROUTE_DASHBOARD`, `ROUTE_LOGIN`, or camelCase like `dashboard`, `login`? (Decision needed from team). Use camelCase like `dashboard`, `login`.
- Should nested routes be composed from parent constants (e.g. `ROUTE_DASHBOARD + '/transactions'`) or be independent full-path constants? `transactions: '/dashboard/transactions'.

## Testing Guidelines

No runtime logic changes are expected, so dedicated tests are not required. Verification is via `pnpm type-check && pnpm lint && pnpm build`.
