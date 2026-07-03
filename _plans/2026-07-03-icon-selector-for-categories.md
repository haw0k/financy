# Plan: feat: Icon Selector for Categories and Category Types

## Spec

Link: [Icon Selector for Categories and Category Types](_specs/2026-07-03-icon-selector-for-categories.md)

## Current State

The application has New Category and New Category Type forms that already use the custom Select component for fields such as category type and direction. The categories table and category types table display existing fields, but no icon column or icon rendering exists. The icon field is not yet part of the data model, forms, or display.

## Implementation Steps

### Phase 1 — Icon Set and Data Model

- [x] Define a shared icon set and value-to-component mapping for categories and category types.
- [x] Add icon storage to the categories and category types data model.
- [x] Update the database initialization script and any relevant types/interfaces to include the icon field.

### Phase 2 — Category and Category Type Forms

- [x] Add an Icon select field to the New/Edit Category form.
- [x] Add an Icon select field to the New/Edit Category Type form.
- [x] Use the existing custom Select component from `@/components/ui` for the icon dropdown.
- [x] Wire the selected icon through form submission and the corresponding server actions.
- [x] Make the icon optional with a sensible default value.

### Phase 3 — Tables and Edge Cases

- [x] Render the selected icon in the categories table.
- [x] Render the selected icon in the category types table.
- [x] Provide a fallback icon for existing records that do not have an icon value.
- [x] Handle unknown or invalid icon values gracefully.
- [x] Verify the icon dropdown remains usable on mobile viewports.

### Phase 4 — Tests and Verification

- [x] Add tests verifying the icon select is present in the category form.
- [x] Add tests verifying the icon select is present in the category type form.
- [x] Add tests verifying the selected icon value is submitted correctly.
- [x] Add tests verifying the icon is rendered in the categories and category types tables.
- [x] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and fix any regressions.

## Risks & Notes

- Categories and category types share the same icon set via `lib/icons.ts`.
- A category type icon change does not affect categories that reference that type.
- Unknown or missing icon values fall back to the default `circle` icon.
- The icon dropdown reuses the existing custom Select component from `@/components/ui`.

## Definition of Done

- [x] Icon select is visible and functional in the New Category form.
- [x] Icon select is visible and functional in the New Category Type form.
- [x] Icon select uses the custom Select component from `@/components/ui`.
- [x] Selected icon is saved and displayed in the categories table.
- [x] Selected icon is saved and displayed in the category types table.
- [x] Optional icon has a default value that does not break existing records.
- [x] Existing tests pass and new tests cover icon selection behavior.
