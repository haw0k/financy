# Spec for Extract Site Config

branch: refactor/extract-site-config

## Summary

Create `config/site.config.ts` with a typed `siteConfig` object containing the project's meta information (name, description, accent color), and replace all hardcoded occurrences of these values across the codebase with imports from the new config.

## Functional Requirements

- Create `config/site.config.ts` with:
  - `name: 'Financy'`
  - `description: '...'` — a short project description
  - `accentColor: '#00A541'`
- Export `siteConfig` from `config/index.ts`
- Replace all hardcoded `'Financy'` strings in `app/` and `components/` with `siteConfig.name`
- Replace all hardcoded `'#00A541'` strings with `siteConfig.accentColor`
- Replace hardcoded page descriptions (e.g., `'Sign in to your Financy account'`) with `siteConfig.description` where appropriate, or keep page-specific descriptions but reference the site name dynamically
- Page titles like `'Dashboard — Financy'` should use template literals referencing `siteConfig.name`

## Possible Edge Cases

- Some meta descriptions are page-specific (`'Sign in to your Financy account'`) — these should be kept as-is but reference `siteConfig.name` dynamically
- The `alt` text for the logo image (`"Financy"`) should reference `siteConfig.name`
- The `Financy v1.0` text in SettingsPage should use `siteConfig.name`
- The `fontSize: '26px', fontWeight: 700` inline styles on the logo text are shared across 3 files (Header, DashboardNav, MobileNav) — these could also be extracted into the config or a shared constant

## Acceptance Criteria

- `config/site.config.ts` exists and exports a typed `siteConfig` object
- `config/index.ts` re-exports `siteConfig`
- No hardcoded `'Financy'` strings remain in `app/` or `components/`
- No hardcoded `'#00A541'` strings remain in `app/` or `components/`
- All existing functionality is preserved
- `pnpm type-check && pnpm lint && pnpm build` passes

## Open Questions

- Should the logo text styles (`fontSize: '26px', fontWeight: 700`) also be extracted?
- What should the site description say?

## Testing Guidelines

No new tests needed — this is a refactoring task. Verify via build commands.
