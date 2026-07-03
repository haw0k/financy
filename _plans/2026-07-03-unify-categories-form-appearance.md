# Plan: refactor: Unify Categories Form Appearance with Transactions

## Spec

Link: [Unify Categories Form Appearance with Transactions](_specs/2026-07-03-unify-categories-form-appearance.md)

## Current State

The `/dashboard/categories` page renders two inline forms: one for categories and one for category types. Both forms are currently implemented as plain stacked fields inside a card without grouped sections. The `/dashboard/transactions` form already uses `fieldset`/`legend` grouping and marks required fields with a red asterisk, which serves as the target visual pattern.

## Implementation Steps

### Phase 1 — Form Structure Update

- [ ] Wrap the category form fields into logical `fieldset` sections with `legend` titles, mirroring the transaction form layout.
- [ ] Wrap the category type form fields into a `fieldset` section with a `legend` title.
- [ ] Preserve existing state, submission handlers, and validation behavior.

### Phase 2 — Required Field Indicators

- [ ] Add a red asterisk indicator to labels of required fields in both forms.
- [ ] Ensure optional fields do not display the required indicator.
- [ ] Keep label styling consistent with the transaction form (text-xs, muted-foreground).

### Phase 3 — Responsive Alignment

- [ ] Verify field alignment and spacing remain correct on mobile and desktop viewports.
- [ ] Ensure the color picker circle still aligns with the surrounding field group.

### Phase 4 — Verification

- [ ] Run `pnpm check` and `pnpm type-check`.
- [ ] Run the existing Vitest suite.
- [ ] Add or update tests to verify fieldset/legend presence and required asterisk rendering.

## Risks & Notes

- The color picker uses a custom circular swatch and must remain accessible and aligned.
- Category Type is optional and must not be marked as required.
- Existing keyboard navigation and focus order must not regress.

## Definition of Done

- [ ] Category form matches the transaction form visual pattern.
- [ ] Category type form matches the transaction form visual pattern.
- [ ] Required fields display a red asterisk; optional fields do not.
- [ ] `pnpm check`, `pnpm type-check`, and `pnpm test:run` all pass.
