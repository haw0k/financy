# Spec for Unify Categories Form Appearance with Transactions

branch: refactor/unify-categories-form-appearance

## Summary

Restyle the category and category-type forms on `/dashboard/categories` so they visually match the transaction form on `/dashboard/transactions`. The forms should use grouped sections with `fieldset` and `legend`, and required fields must be marked with a red asterisk.

## Functional Requirements

- The **Add/Edit Category** form must visually match the transaction form layout pattern.
- The **Add/Edit Category Type** form must also follow the same layout pattern.
- Form sections must be wrapped in `fieldset` elements with a `legend` title.
- Required fields must be labeled with a red asterisk indicator (`*`).
- Optional fields must not display the required indicator.
- The existing form behavior, validation rules, and submission logic must remain unchanged.
- The form must remain responsive and usable on mobile and desktop viewports.

## Possible Edge Cases

- A field is conditionally required depending on another field's value.
- The category type selector is optional and should not show the required indicator.
- The color picker has no textual value display and must still align with the rest of the field group.
- Existing keyboard navigation and focus order must be preserved.

## Acceptance Criteria

- [ ] Category form uses `fieldset`/`legend` grouping matching the transaction form.
- [ ] Category type form uses `fieldset`/`legend` grouping matching the transaction form.
- [ ] All required fields in both forms show a red asterisk next to the label.
- [ ] Optional fields do not show the red asterisk.
- [ ] No visual regressions on `/dashboard/categories` at common breakpoints.
- [ ] All existing categories and category types tests still pass.

## Open Questions

- Should the `Color` field be considered required, or should it remain optional with a default value? it's remains optional with a default value
- Should the Category Type selector be moved into a separate `fieldset` group or kept inside the main category group? Keep it inside the main category group. Try to keep all form fields withion one row on wide screens.

## Testing Guidelines

Create a test file(s) in the `./tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Render the category form and verify required labels show a red asterisk.
- Render the category type form and verify required labels show a red asterisk.
- Verify optional fields do not display a red asterisk.
- Verify `fieldset` and `legend` elements are present in both forms.
