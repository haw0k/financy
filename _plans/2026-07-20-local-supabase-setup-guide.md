# Plan: docs: Local Supabase Setup Guide

## Spec

Link: [Local Supabase Setup Guide](_specs/2026-07-20-local-supabase-setup-guide.md)

## Current State

`CLOUD_SETUP.md` documents cloud Supabase setup but does not cover running the project entirely locally. Contributors who want to avoid cloud infrastructure need a separate guide for installing the Supabase CLI, starting local services, configuring environment variables for local Supabase, and initializing the database.

## Implementation Steps

### Phase 1 — Audit and Structure

- [x] Decide whether to add a new `LOCAL_SETUP.md` file or extend `CLOUD_SETUP.md` with a local section. Choose the option that keeps cloud and local instructions clearly separated.
- [x] Identify all environment variables that differ between cloud and local Supabase (URL, anon key, service role key, redirect URL).
- [x] List prerequisites: Node.js, pnpm, Docker, Supabase CLI.

### Phase 2 — Draft Local Setup Content

- [x] Document Supabase CLI installation and `supabase login` / `supabase link` differences for local-only usage.
- [x] Document `supabase init` and `supabase start`, including expected output and local URLs/ports.
- [x] Explain how to read local Supabase credentials from the CLI output or `supabase status`.
- [x] Provide a `.env.local` template for local development with example values.
- [x] Document how to apply `scripts/001_init_database.sql` to the local Postgres database using `supabase db reset` or the local SQL Editor/PSQL.
- [x] Describe the first admin registration flow in the local environment, including email confirmation handling with Inbucket.
- [x] Describe regular user registration and admin approval in the local environment.
- [x] Document how to stop (`supabase stop`) and reset (`supabase db reset`) the local stack.

### Phase 3 — Troubleshooting and Polish

- [x] Add a troubleshooting section covering Docker not running, port conflicts, CLI version mismatch, and local email not arriving.
- [x] Verify that commands and environment values are accurate for the current Supabase CLI.
- [x] Run `pnpm format:fix` and `pnpm check` on any changed documentation.

## Risks & Notes

- Keep the guide focused on local Supabase CLI usage; avoid plain Docker Compose instructions unless explicitly required.
- Do not include real secrets or keys in examples.
- Local Inbucket is the default email sink for Supabase CLI; mention it for testing confirmation emails.
- Ensure the guide links back to cloud setup instructions where appropriate to avoid duplication.

## Definition of Done

- [x] A local setup guide file exists and is referenced from the project root or README.
- [x] All implementation steps are marked complete.
- [x] The guide includes copy-paste-ready commands and an `.env.local` template.
- [x] Database initialization, admin setup, and user approval are documented for the local environment.
- [x] The plan and spec are marked complete in `_plans/_description.md` and `_specs/_description.md`.
- [x] `pnpm check` passes.
