# Plan: docs: Document React Server Components Practical Patterns

## Spec

Link: [Document React Server Components Practical Patterns](../_specs/2026-06-20-document-rsc-patterns.md)

## Context

Financy already runs almost entirely on React Server Components and Next.js Server Actions: page routes in `app/` are thin async wrappers, data fetching happens server-side through `lib/supabase/server.ts`, and mutations are handled by `app/actions/`. The browser Supabase client was removed in favor of Server Actions. However, this architecture is currently only described in fragments across `README.md`, `PROJECT_SUMMARY.md`, and `CLAUDE.md`.

The goal is to consolidate these patterns into a single practical guide that demonstrates how RSC fits into a real full-stack app with authentication and a relational SQL database.

## Current State

- `app/(app)/dashboard/page.tsx` — thin re-export of a Server Component page
- `app/(app)/admin/page.tsx` — async Server Component with `requireApprovedAdmin()` guard
- `components/pages/dashboard/DashboardPage.tsx` — async Server Component that calls a Server Action for data
- `app/actions/dashboard.ts` — `'use server'` action that queries PostgreSQL directly
- `app/actions/auth.ts` — auth mutations run server-side via `createClient()` from `@/lib/supabase/server`
- `lib/require-auth.ts` — shared guards used by Server Components and Server Actions
- `components/pages/auth/LoginPage.tsx` — Client Component that submits to a Server Action
- `app/layout.tsx` — async Server Component that reads the session and passes role/status to `RoleProvider`
- No single document ties these patterns together with decision guidance

## Design Decisions

1. **File location**: `docs/react-server-components-guide.md` — sits alongside `docs/refactoring-tasks.md` and naming/commit conventions.
2. **Tone**: practical, example-driven, targeted at developers who already know React but want to see RSC in a working full-stack app.
3. **Structure**:
   - Overview of RSC in the project
   - The thin-route pattern
   - Data flow: Server Component → Server Action → PostgreSQL
   - Authentication integration in RSC
   - Client Components: when and why
   - Decision matrix
   - Trade-offs and pet-project simplifications
   - Further reading
4. **Code examples**: all examples reference actual files with relative paths; no fictional code so the guide stays maintainable.
5. **Linking**: add the guide to README.md's documentation list and to the Features Roadmap so it is discoverable.

## Implementation Steps

### Phase 1 — Audit current RSC usage

- [x] Identify Server Component page routes (`app/(app)/*`, `app/(auth)/*`)
- [x] Identify Server Actions (`app/actions/*.ts`)
- [x] Identify shared auth guards (`lib/require-auth.ts`)
- [x] Identify representative Client Components (`components/pages/auth/LoginPage.tsx`)

### Phase 2 — Write the guide

- [x] Create `docs/react-server-components-guide.md`
- [x] Add overview section explaining RSC in Next.js App Router
- [x] Add thin-route pattern section with `app/(app)/dashboard/page.tsx` example
- [x] Add data-fetching section with `components/pages/dashboard/DashboardPage.tsx` and `app/actions/dashboard.ts`
- [x] Add auth integration section with `app/(app)/admin/page.tsx` and `lib/require-auth.ts`
- [x] Add Client Component section with `components/pages/auth/LoginPage.tsx`
- [x] Add decision matrix
- [x] Add trade-offs and RLS note
- [x] Add further reading links

### Phase 3 — Link the guide

- [x] Add guide to README.md documentation list
- [x] Add `Documentation` item to README.md Features Roadmap (or mark completed)

### Phase 4 — Update project indexes

- [x] Add entry to `_specs/_description.md`
- [x] Add entry to `_plans/_description.md`

### Phase 5 — Verification

- [x] Run `pnpm lint` to ensure no markdown or code-style regressions
- [x] Verify all referenced file paths still exist
- [x] Verify README.md documentation links are valid

## Files Summary

| Action | File                                    |
| ------ | --------------------------------------- |
| CREATE | `docs/react-server-components-guide.md` |
| MODIFY | `README.md`                             |
| MODIFY | `_specs/_description.md`                |
| MODIFY | `_plans/_description.md`                |

## Risks & Notes

- The guide will reference specific files; those references may drift as the codebase changes. The guide should be treated as living documentation and updated when major architectural changes happen.
- The guide intentionally stays focused on RSC practical patterns. It does not replace `PROJECT_SUMMARY.md` or `CLOUD_SETUP.md`.

## Definition of Done

- [x] `docs/react-server-components-guide.md` exists and covers the required sections
- [x] README.md links to the new guide
- [x] `_specs/_description.md` and `_plans/_description.md` include the new entry
- [x] All referenced files exist at the time of writing
- [x] `pnpm lint` passes
