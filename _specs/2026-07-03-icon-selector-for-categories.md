# Spec for Icon Selector for Categories and Category Types

branch: feat/icon-selector-for-categories

## Summary

Add an icon selection dropdown to the **New Category** and **New Category Type** forms. Users should be able to pick an icon from a predefined set when creating or editing a category or category type. The selected icon must be stored alongside the existing category/category type data and displayed in the corresponding tables.

## Functional Requirements

- The category form must include an **Icon** select field with a predefined set of available icons.
- The category type form must include an **Icon** select field with a predefined set of available icons.
- Each option in the icon select must show both the icon visual and a human-readable label.
- The icon field must be optional and have a sensible default value.
- The selected icon must be persisted for both categories and category types.
- Existing categories and category types without an icon must retain their current behavior (fallback or default icon).
- The icon must be displayed in the categories table and category types table.
- The icon selection should use the same custom Select component used elsewhere in the application.

## Possible Edge Cases

- A category type icon is changed after categories already reference that type.
- An unknown or missing icon value is loaded from existing data.
- The icon set needs to be shared between categories and category types.
- Mobile viewports require the icon dropdown to remain usable.

## Acceptance Criteria

- [x] Icon select is visible and functional in the New Category form.
- [x] Icon select is visible and functional in the New Category Type form.
- [x] Icon select uses the custom Select component from `@/components/ui`.
- [x] Selected icon is saved and displayed in the categories table.
- [x] Selected icon is saved and displayed in the category types table.
- [x] Optional icons have a default value that does not break existing records.
- [x] Existing tests pass and new tests cover icon selection behavior.

## Open Questions

- Should categories and category types share the same icon set, or should each have its own set?  The sane icon set
- Where should the icon component/value mapping live in the codebase? use `lib/icons`
- Should the icon be rendered using a specific icon library (e.g., `lucide-react`) or be stored as a string identifier? please use `lucide-react` and lucide icons.

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Render the category form and verify the Icon select is present.
- Render the category type form and verify the Icon select is present.
- Select an icon in the category form and submit, verifying the correct icon value is sent.
- Verify the icon is rendered in the categories table after selection.
- Verify the icon is rendered in the category types table after selection.
