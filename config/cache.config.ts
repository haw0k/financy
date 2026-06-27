/**
 * Stable cache tags used across the application. Co-locating them here reduces the risk of
 * misspelling a tag in a read function or a mutation action, which would leave stale data
 * visible after writes.
 */
export const CACHE_TAGS = {
  categories: 'categories',
  categoryTypes: 'category-types',
  dashboard: 'dashboard',
  receivers: 'receivers',
  transactions: 'transactions',
} as const;

/**
 * Shared cache lifetime used for all dashboard data. A single, simple TTL keeps the caching
 * implementation easy to reason about while still reducing redundant database queries when
 * navigating between pages.
 *
 * The value is intentionally conservative (30 seconds) to keep financial data reasonably fresh
 * without re-fetching on every page transition.
 */
export const dashboardCacheLife = {
  stale: 30,
  revalidate: 30,
  expire: 60,
};

/**
 * Profile passed to `revalidateTag` after a successful mutation. The built-in `max` profile
 * expires matching cached entries immediately so the next read sees fresh data.
 */
export const mutationRevalidateProfile = 'max';
