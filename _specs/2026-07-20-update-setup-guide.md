# Spec for Update Setup Guide Documentation

branch: docs/update-setup-guide

## Summary

Update the project setup guide in `SETUP_GUIDE.md` so that it accurately reflects the current application architecture, environment configuration, database initialization, and account recovery procedures. The guide should help new contributors and the project owner restore the application after Supabase infrastructure changes such as project URL updates or full database resets after a freeze.

## Functional Requirements

- Review the existing `SETUP_GUIDE.md` for outdated commands, paths, or environment variables.
- Document the required environment variables and where to retrieve each value from the Supabase Dashboard.
- Describe the database initialization process using `scripts/001_init_database.sql`.
- Explain the registration and approval flow for the first admin and subsequent regular users.
- Add a troubleshooting section covering recovery after a Supabase project freeze or URL change.
- Keep formatting and style consistent with other project documentation.

## Possible Edge Cases

- The Supabase project URL changes after reactivation from a paused state.
- The database is empty after a freeze because the instance was recreated.
- Email confirmation links expire before the user clicks them.
- The first admin is confirmed through the Supabase Dashboard, so the auto-approval trigger does not fire automatically.
- A user tries to register an admin when one already exists.

## Acceptance Criteria

- `SETUP_GUIDE.md` contains an up-to-date list of all required environment variables with descriptions.
- The guide includes step-by-step instructions for running the database initialization script in the Supabase SQL Editor.
- The first-admin setup flow is documented, including the manual fallback when the confirmation email fails.
- Regular user registration and admin approval are documented.
- A troubleshooting section explains how to recover from a changed Supabase URL or empty database.
- All existing links in `SETUP_GUIDE.md` still resolve to the correct internal or external targets.

## Open Questions

- Should the guide mention backing up the database before applying `scripts/001_init_database.sql`? You decide
- Is it acceptable to keep the guide in English, or should it support both English and the language used by the project owner? Enlish only

## Testing Guidelines

- Follow the updated guide from a clean environment and verify that the application starts with `pnpm dev`.
- Verify that the documented database initialization script runs without errors in a fresh Supabase project.
- Confirm that the documented admin registration and approval flow produces an approved admin account.
- Confirm that a regular user can sign up, confirm their email, be approved by the admin, and access the dashboard.
