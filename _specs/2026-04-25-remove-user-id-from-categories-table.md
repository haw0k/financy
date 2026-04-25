# Spec for Remove User Id From Categories Table

branch: fix/remove-user-id-from-categories

## Summary

When adding a new category on `/dashboard/categories`, the insert fails with a foreign key violation error `23503` — the `user_id` references a `profiles` record that may not exist for the user. The `user_id` field is unnecessary since users should have access to the same set of global categories.

## Functional Requirements

- Remove `user_id` column from the `categories` table
- Remove the foreign key constraint referencing `profiles(id)` on `categories.user_id`
- Update RLS policies for categories to work without `user_id`
- All categories become global (visible to all authenticated users), similar to `category_types`
- The `categories` table insert should succeed without specifying a `user_id`

## Possible Edge Cases

- Existing categories with `user_id` set will need migration handling
- RLS policies currently filter by `auth.uid() = user_id` — must be updated to allow all authenticated users to see all categories
- TransactionForm component may reference `user_id` for categories filtering
- RLS for transactions references `category_id` but not `user_id` — should not be affected
- If the DB is being recreated from script, no migration concerns

## Acceptance Criteria

- Adding a new category succeeds without `user_id` errors
- All authenticated users can see all categories
- The categories dropdown in transaction forms shows all available categories
- RLS policies are updated to match the new schema (no per-user filtering)

## Open Questions

- Should categories remain user-specific in some other way, or is fully global the intended design? (User confirmed: remove `user_id` entirely) categories is fully global/

## Testing Guidelines

- Create a new category on `/dashboard/categories` — should succeed
- View categories — should show all categories (not filtered by user)
- Create a transaction — the categories dropdown should list all categories
- Run lint and build to verify TypeScript/types are updated
