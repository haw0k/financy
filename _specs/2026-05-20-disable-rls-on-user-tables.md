# Spec for Disable Row Level Security on User Tables

branch: chore/disable-rls-on-user-tables

## Summary

Disable Row Level Security (RLS) on all user-facing tables in Supabase so that all authenticated users share the same data — categories, transactions, category types, and profiles. Currently RLS restricts each user to their own rows; after this change, every user sees and manages a common pool of data.

## Functional Requirements

- RLS must be disabled on the `profiles` table
- RLS must be disabled on the `categories` table
- RLS must be disabled on the `category_types` table
- RLS must be disabled on the `transactions` table
- All authenticated users must see the same rows in each table
- All authenticated users must be able to create, update, and delete rows in each table (subject to application-level rules, not RLS)

## Possible Edge Cases

- Existing per-user data may need to be deduplicated or consolidated after RLS is removed — two users could have identically named categories that were previously isolated
- Application code that relies on RLS (e.g., `user_id` filtering in queries) must be reviewed and potentially removed or replaced
- Admin-specific data access patterns that previously used the admin Supabase client (which bypasses RLS) should still work correctly
- The `profiles` table currently has a policy allowing users to see only their own profile — after disabling RLS, all users will see all profiles

## Acceptance Criteria

- RLS is disabled on `profiles`, `categories`, `category_types`, and `transactions` tables
- A regular user logs in and sees the same categories as another regular user
- A regular user logs in and sees the same transactions as another regular user
- Creating, updating, and deleting records works for any authenticated user
- Database migration script is added to `scripts/` for reproducibility

## Open Questions

- Should RLS be disabled or simply altered to allow broader access? (Disabling is simpler and matches the requirement of shared data) disabled by default in scripts/001_init_database.sql
- Should any table retain RLS for specific columns or operations? No
- Should the database trigger that auto-approves the first admin be reviewed in light of this change? You decide.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify the migration script syntax is valid
- Verify that the application behaves correctly after RLS is disabled (no regressions in data access patterns)
