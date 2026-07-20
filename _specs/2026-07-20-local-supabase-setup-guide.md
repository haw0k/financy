# Spec for Local Supabase Setup Guide

branch: docs/local-supabase-setup-guide

## Summary

Create documentation that explains how to install and run the Financy project locally without relying on the cloud Supabase infrastructure. The guide should cover local Supabase setup, environment configuration, database initialization, and admin/user registration using only local services.

## Functional Requirements

- Provide a clear list of prerequisites for local development without cloud Supabase.
- Document how to install and start a local Supabase instance using the Supabase CLI.
- Explain how to obtain local Supabase credentials and configure environment variables.
- Describe how to initialize the local database using the existing SQL initialization script.
- Cover the first admin registration flow in the local environment.
- Cover regular user registration and approval flow in the local environment.
- Include guidance for stopping, resetting, and updating the local Supabase instance.
- Add a troubleshooting section for common local setup issues.

## Possible Edge Cases

- The user already has Docker installed but not running.
- The default Supabase CLI ports are already in use by another service.
- The user has an older version of the Supabase CLI installed.
- The user is on Windows and shell commands differ from Unix examples.
- The local database has been reset and the admin profile needs to be recreated.
- Email confirmation links from local Supabase Auth are handled differently than in production.

## Acceptance Criteria

- A dedicated local setup guide file exists and is reachable from the project root or README.
- The guide includes copy-paste-ready commands for each setup step.
- All required environment variables for local Supabase are documented with example values.
- The guide clearly distinguishes between the cloud Supabase setup and the local setup.
- Database initialization steps refer to the existing SQL script and explain how to apply it to the local instance.
- The admin and user registration flows are described with the local Supabase specifics in mind.
- A troubleshooting section lists at least three common local setup problems and solutions.

## Open Questions

- Should this be a separate `LOCAL_SETUP.md` file or an additional section in the existing `SETUP_GUIDE.md`? Separate
- Should the guide recommend the Supabase CLI as the primary method, or also document a plain Docker Compose alternative? Supabase CLI
- Should the guide include instructions for seeding sample data after local initialization? Yes

## Testing Guidelines

No automated tests are required for documentation. Perform a manual verification by following the guide on a clean machine or environment to confirm every command produces the expected result.
