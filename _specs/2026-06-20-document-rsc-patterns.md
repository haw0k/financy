# Spec for Document React Server Components Practical Patterns

branch: docs/document-rsc-patterns

## Summary

Create a project guide that documents how React Server Components (RSC) are applied in practice inside Financy — a full-stack Next.js application with Supabase authentication and a PostgreSQL relational database. The guide should explain the rationale behind the current architecture, show concrete code patterns taken from the codebase, and establish clear decision criteria for when to use Server Components, Client Components, and Server Actions.

This documentation turns the project's architecture into a reusable reference for developers who want to see RSC working together with auth guards, SQL queries, and progressive enhancement in a real application.

## Functional Requirements

- Explain what React Server Components are and why the project uses them
- Document the thin-route / heavy-component page pattern used in `app/(app)/*`
- Show how Server Components fetch data directly from PostgreSQL via the server Supabase client
- Document how authentication and authorization are integrated into Server Components and Server Actions (`requireAuth`, `requireApprovedUser`, `requireApprovedAdmin`)
- Explain the role of Server Actions as the bridge between Client Components and the database
- Provide a decision matrix: Server Component vs Client Component vs Server Action
- Include real code examples from `app/`, `app/actions/`, `lib/require-auth.ts`, and `components/`
- Document the removal of the browser Supabase client and the reasoning behind it
- Cover error handling, loading states, and progressive enhancement patterns
- Mention the intentional RLS-disabled pet-project simplification and how access control is still enforced

## Possible Edge Cases

- Examples may become stale as the codebase evolves; examples must reference specific files and line ranges so future updates are discoverable
- The guide must not duplicate the full README or PROJECT_SUMMARY; it should focus on RSC practical patterns
- Decision matrix must account for the case where a Client Component needs data that was fetched on the server

## Acceptance Criteria

- A new guide file exists at `docs/react-server-components-guide.md`
- The guide is linked from the README documentation section
- All code examples are taken from the actual project and reference real files
- The guide includes at least one Server Component example, one Server Action example, one Client Component example, and one auth guard example
- The decision matrix covers auth checks, interactivity, and database mutations
- A new spec/plan entry is added to `_specs/_description.md` and `_plans/_description.md`

## Open Questions

- Should the guide include a comparison with the previous architecture that used the browser Supabase client? Yes, briefly mention the migration motivation.
- Should the guide include diagrams? ASCII diagrams are acceptable if they improve clarity. Use github.com MD compatible font and symbols for ASCII diagrams.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Not applicable for pure documentation; instead verify that all referenced files still exist and that markdown links resolve correctly.