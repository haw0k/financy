# Spec for Add Category Type Management

branch: feat/add-category-type-management

## Summary

Currently, category types (e.g., "Consumer goods", "Food") can only be added via the Supabase database directly. There is no UI in the application to create, edit, or delete category types. This spec adds a dedicated management interface for category types.

## Functional Requirements

- Add a new page or section for managing category types (CRUD operations)
- Allow users to view all existing category types
- Allow users to create a new category type by providing a name
- Allow users to edit an existing category type name
- Allow users to delete a category type
- Category types are global reference records (not user-specific)
- When a category type is deleted, categories referencing it should have their `type_id` set to null (no cascade delete)

## Possible Edge Cases

- Deleting a category type that is referenced by existing categories — should not delete the categories, only unset their type
- Duplicate category type names (name is unique) — should show validation error
- Empty name input — should be prevented by form validation

## Acceptance Criteria

- New management section/page for category types exists in the dashboard
- User can see a list of all category types with their names
- User can add a new category type via a form/input
- User can edit an existing category type name
- User can delete a category type
- Categories page updates reflect the current set of category types (no stale references)
- Adding, editing, and deleting category types works without errors

## Open Questions

- Should category type management be on its own page or integrated into the Categories page? (e.g., dashboard/category-types or inline in dashboard/categories) inline in dashboard/categories.
- Should there be a confirmation dialog before deleting a category type? Yes

## Testing Guidelines

- Test CRUD operations: create, read, update, delete category types
- Test that deleting a category type doesn't delete associated categories
- Test validation for duplicate names
- Test empty input validation
