# Spec for Migrate All Selects To Shadcn Select

branch: refactor/migrate-all-selects-to-shadcn

## Summary

Replace all native HTML `<select>` / `<option>` elements across the application with the shadcn/ui `Select` component (`@/lib/shadcn`). This ensures consistent styling, theming, accessibility, and behavior across all select inputs.

## Functional Requirements

- Replace all native `<select>` elements in the following components with the shadcn `Select` component:
  - `CategoriesTable.tsx` — category type filter (expense/income) and category type selector
  - `TransactionForm.tsx` — transaction type (expense/income) and receiver selector
  - `SignUpPage.tsx` — role selector (sender/receiver) on signup
- Each select must retain its current functionality, options, and default/placeholder values
- Shadcn Select must use the existing `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, and `SelectGroup` sub-components

## Possible Edge Cases

- The role selector in `SignUpPage.tsx` uses `defaultValue` on a native select inside a form — shadcn Select uses a different controlled/uncontrolled pattern (`value`/`onValueChange` or `defaultValue` on `Select.Root`)
- Form submission with shadcn Select may differ from native select — ensure form data still includes the selected value correctly
- The receiver selector in `TransactionForm.tsx` is populated dynamically from a users list — ensure the shadcn Select items render and update correctly when the list changes
- Placeholder/empty value handling — native `<option value="">` serves as a placeholder; shadcn Select uses `SelectValue` with an optional placeholder prop

## Acceptance Criteria

- All native `<select>` and `<option>` elements are removed from `CategoriesTable.tsx`, `TransactionForm.tsx`, and `SignUpPage.tsx`
- Each replaced select behaves identically to the original: same options, same default values, same data flow
- Form submission works correctly with shadcn Select in all forms
- No regressions in the signup flow, transaction creation, or category management

## Open Questions

- Should the Select trigger be full-width (`w-full`) in some contexts (e.g., transaction form) or keep `w-fit`? If Select placed in one row (like in SignUpPage), set full-width. If Select not alone in a row, keep `w-fit`.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify that each shadcn Select renders the correct options
- Verify that selecting an option updates the displayed value
- Verify that form submission includes the correct selected value
