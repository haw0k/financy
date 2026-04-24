# Spec for Add Category Types Table

branch: feat/add-category-types-table

## Summary

Add a new `category-types` table to organize categories into groups (e.g., "Consumer goods", "Food"). Each category will reference a category type via `type_id` foreign key.

## Functional Requirements

- Create `category-types` table with `id` and `name` columns (global reference table, not user-specific)
- Add `type_id` column to existing `categories` table as a foreign key reference
- Add migration script with default types: "Consumer goods", "Food"
- Update existing categories with appropriate type_id values

## Database Schema

### category-types table

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, default gen_random_uuid() |
| name | text | not null, unique |
| created_at | timestamptz | default now() |

### categories table (updated)

Add `type_id` column referencing `category-types.id`

## Possible Edge Cases

- User deletes a category type that is still referenced by categories
- User tries to create duplicate category type names
- Migrating existing categories without type_id (set to null initially)

## Acceptance Criteria

- `category-types` table exists with proper constraints (global reference table)
- `categories` table has `type_id` column with FK to `category-types`
- Transaction integrity maintained during migration
- Default types seeded correctly

## Open Questions

- Do we need a UI for managing category types, or is this purely backend? Yes, we need to support the feature in /dashboard/categories and /dashboard/transactions pages.

## Testing Guidelines

Create a test file in ./tests folder for migration validation:

- Verify `category-types` table can be created
- Verify FK constraint between categories and category-types works correctly