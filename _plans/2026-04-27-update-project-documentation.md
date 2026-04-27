# Plan: Update Project Documentation

Spec: `_specs/2026-04-27-update-project-documentation.md`
Branch: `docs/update-project-documentation`

## Context

Five documentation files need updating to reflect recent project changes: new directories (`config/`, `components/providers/`, `components/ui/`, `_specs/`, `_plans/`), new env var (`NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`), and a centralized config pattern (`@/config`). All files have a stale `components/layout/` path that should be `components/layouts/`.

## Changes

### Common to all files

**Fix stale path:** `components/layout/` → `components/layouts/` everywhere.

**Add new directories** to project structure listings:
- `components/providers/` — React context providers (ThemeProvider, MobileNavContext)
- `components/ui/` — Reusable UI components (PasswordField, DatePicker)
- `config/` — Centralized config (env, routes, site, navigation)
- `_specs/` — Feature specs
- `_plans/` — Implementation plans

### File-specific changes

#### AGENTS.md
- Fix path in Structure section
- Add new directories to Structure list

#### CLAUDE.md
- Fix path in Key Directories
- Add new directories
- Update Data Flow diagram to include `config/` layer
- Document config pattern (`@/config` with `as const` exports)
- Document `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` env var

#### PROJECT_SUMMARY.md
- Fix path in project tree and tech stack
- Add new directories to project structure tree
- Remove `proxy.ts` from tree (no longer exists)
- Fix `Finance Tracker` title → `Financy`

#### README.md
- Fix path in Project Structure
- Add new directories to project structure tree
- Add `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to Environment Variables section
- Add `_specs/` and `_plans/` references to development workflow

#### SETUP_GUIDE.md
- Fix path in Tech Stack and Project Structure
- Add new directories to Tech Stack and Project Structure
- Add `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to env var setup section

## Files Modified

- `AGENTS.md`
- `CLAUDE.md`
- `PROJECT_SUMMARY.md`
- `README.md`
- `SETUP_GUIDE.md`

## Verification

- Read each file — all paths correct, new directories listed
- `components/layout/` no longer appears in any doc file
- Config pattern and new env var documented where relevant
