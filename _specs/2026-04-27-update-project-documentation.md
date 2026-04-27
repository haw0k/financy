# Spec for Update Project Documentation

branch: docs/update-project-documentation

## Summary

The project has evolved significantly since CLAUDE.md was first created. New directories (`config/`, `components/providers/`, `components/ui/`, `_specs/`, `_plans/`) and a new environment variable (`NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`) have been added through recent refactoring work. The documentation needs to reflect these changes to keep Claude Code guidance accurate and complete.

## Functional Requirements

- Update the Key Directories section in CLAUDE.md to include new directories:
  - `config/` — centralized configuration (env, routes, site, navigation)
  - `components/providers/` — React context providers (MobileNavContext, ThemeProvider)
  - `components/ui/` — reusable UI components (PasswordField, DatePicker)
  - `_specs/` — feature specification files
  - `_plans/` — implementation plan files
- Fix the incorrect `components/layout/` path to `components/layouts/` in the Key Directories section
- Update the Data Flow section to reflect the config abstraction layer (env vars, routes, site config flow through `@/config`)
- Add documentation for the centralized config pattern used in `config/`
- Document the new environment variable `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` and its purpose (dev-only redirect override)

## Possible Edge Cases

- CLAUDE.md is consumed by Claude Code and should remain concise — avoid overspecifying implementation details
- The config pattern documentation should match the actual `as const` export pattern used across all config files
- Environment variable documentation should clarify which vars are required vs optional

## Acceptance Criteria

- CLAUDE.md accurately lists all project directories with correct paths
- The centralized config pattern is documented
- The new environment variable is documented with its purpose
- All existing content (commands, auth strategy, role system, code style, git conventions) is preserved
- No hardcoded paths or stale references remain

## Open Questions

- Should other config files (navigation.config.ts) be documented separately or grouped under the config pattern? Grouped.

## Testing Guidelines

- No tests required — this is a documentation-only change
- Verify by reading the updated CLAUDE.md to confirm accuracy
