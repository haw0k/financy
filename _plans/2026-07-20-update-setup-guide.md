# Plan: docs: Update Setup Guide Documentation

## Spec

Link: [Update Setup Guide Documentation](_specs/2026-07-20-update-setup-guide.md)

## Current State

`CLOUD_SETUP.md` exists but does not reflect the current environment configuration flow, database initialization steps, or recovery procedures after a Supabase infrastructure reset. The project now uses a centralized `config/env.config.ts`, a single database initialization script, and an admin approval flow that requires specific setup steps. Contributors and the project owner need clearer instructions to stand the application up from scratch or recover after a paused Supabase project is reactivated.

## Implementation Steps

### Phase 1 — Audit and Structure

- [x] Read the full current `CLOUD_SETUP.md` and note outdated sections, broken links, or missing topics.
- [x] Identify all environment variables required by `config/env.config.ts` and `.env.example`.
- [x] Outline the new sections: prerequisites, environment variables, database setup, first admin setup, regular user registration, and troubleshooting.

### Phase 2 — Draft Content

- [x] Update the prerequisites section with Node.js/pnpm versions and Supabase account requirements.
- [x] Add a detailed environment variables table with variable name, source in Supabase Dashboard, and purpose.
- [x] Document how to run `scripts/001_init_database.sql` in the Supabase SQL Editor and warn that it drops existing application tables.
- [x] Document the first admin registration flow at `/auth/admin`, including the email confirmation step and the manual fallback when the confirmation link expires.
- [x] Document regular user sign-up at `/auth/sign-up`, email confirmation, admin approval in `/admin`, and dashboard access.

### Phase 3 — Troubleshooting and Recovery

- [x] Add a troubleshooting section for the case when `SUPABASE_URL` changes after reactivating a paused project.
- [x] Add a subsection for recovering from an empty database after a Supabase instance reset.
- [x] Include SQL snippets for manually approving the first admin when the auto-approval trigger does not fire.
- [x] Verify all internal links and external references still resolve.

## Risks & Notes

- The guide must stay concise enough to be useful but detailed enough for a first-time setup.
- Do not expose real credentials or secrets in the documentation.
- Keep the language and tone consistent with other project docs.
- Avoid duplicating content already covered in `README.md` or `CLAUDE.md`; link instead.

## Definition of Done

- [x] `CLOUD_SETUP.md` is updated and reviewed against the spec acceptance criteria.
- [x] All required environment variables are documented with retrieval instructions.
- [x] Database initialization and first admin setup are described step by step.
- [x] A troubleshooting section covers URL changes, empty database recovery, and manual admin approval.
- [x] The plan file is marked complete in `_plans/_description.md`.
