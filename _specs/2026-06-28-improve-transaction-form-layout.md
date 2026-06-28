# Spec for Improve Transaction Form Layout

branch: feat/improve-transaction-form-layout

## Summary

Redesign the transaction creation/editing form in the dashboard to improve readability and reduce cognitive load. The current form presents all fields as a single flat grid, making it hard to scan. The new layout groups fields into semantic sections, replaces the type dropdown with a toggle, consolidates currency and exchange-rate information, and uses subtler label styling.

## Functional Requirements

- Split the form fields into three clearly separated sections:
  - **Amount** — transaction amount, currency, USD equivalent, and exchange-rate details;
  - **Details** — transaction type, category, and receiver;
  - **Date & note** — transaction date and description.
- Render the Amount fields (`Amount`, `Currency`, `Amount in USD`) in a single three-column row on desktop.
- Show the exchange-rate provider and exchange rate as a compact combined row under the `Amount in USD` field instead of as a full-width standalone field.
- Allow switching the exchange-rate provider via a small inline select embedded in the compact row.
- Keep the exchange-rate value editable inline inside the compact row so users can still override the auto-fetched rate when a bank API is unavailable.
- Replace the `Type` dropdown with a two-item toggle (Expense / Income) using a shadcn ToggleGroup.
- Use smaller, secondary-colored labels (`text-xs text-muted-foreground`) across the form to reduce visual competition with field content.
- Preserve all existing validation, auto-fetch behavior for exchange rates, and server-action submission logic.
- Keep the form responsive: the three-column Amount row should stack or wrap on narrow viewports.

## Possible Edge Cases

- The user edits the exchange rate while a provider fetch is in progress.
- The user selects USD as currency, which should still disable/hide meaningful exchange-rate editing and keep rate at 1.
- Auto-fetched rate arrives after the user has already manually edited the rate.
- Mobile viewport where three columns cannot fit horizontally.
- Toggle group needs to enforce exactly one selected value (expense or income).
- Screen-reader users must still understand the compact provider/rate row despite the smaller visual footprint.

## Acceptance Criteria

- [ ] Transaction form is visually divided into three labeled sections: Amount, Details, Date & note.
- [ ] Amount section shows `Amount`, `Currency`, and `Amount in USD` in one desktop row.
- [ ] Exchange-rate provider is no longer a full-width form field.
- [ ] Provider and editable exchange rate appear as a compact row directly under `Amount in USD`.
- [ ] Provider can be switched via a small inline select in the compact row.
- [ ] `Type` is rendered as a toggle group with `Expense` and `Income` options instead of a dropdown.
- [ ] Form labels use smaller, secondary-colored styling.
- [ ] Existing auto-fetch of exchange rates and USD-amount calculation continues to work.
- [ ] Form submission, validation, create, and update flows remain unchanged.
- [ ] Layout is usable on mobile widths.
- [ ] `pnpm lint`, `pnpm type-check`, and `pnpm test:run` pass.

## Open Questions

- Should the Expense/Income toggle use color hints (e.g. red/green) or stay neutral? neutral for now.
- Should the compact rate input be hidden when USD is selected? yes — rate stays 1 and the input can be disabled or visually minimized.

## Testing Guidelines

Create or update tests in `./tests` only for behavior that can change with the new layout:

- Verify the form still submits the same payload shape (amount, currencyId, exchangeRate, rateProvider, amountUsd, type, date, description, receiverId, categoryId).
- Verify toggling type updates the submitted value between `expense` and `income`.
- Verify selecting a currency still triggers exchange-rate auto-fetch using the selected provider.
- Verify manual edits to the inline exchange rate are preserved on submit.
