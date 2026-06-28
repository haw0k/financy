# Plan: feat: Multi-Currency Support

## Spec

Link: [Multi-Currency Support](_specs/2026-06-27-multi-currency-support.md)

## Current State

The application currently stores transaction amounts as a single numeric value and uses that value directly in dashboard totals and charts. Currencies are not modeled in the database, and there is no concept of exchange rates or USD-equivalent amounts. The transaction creation form collects amount, category, date, and description, but does not offer currency or bank selection. Dashboard analytics aggregate raw transaction amounts without conversion.

## Implementation Steps

### Phase 1 — Database and Data Model

- [x] Create the currencies table and seed it with UAH, USD, and EUR.
- [x] Add currency, exchange rate, and USD-equivalent amount columns to the transactions table.
- [x] Update TypeScript interfaces and schemas to include the new transaction fields.

### Phase 2 — Exchange Rate Services

- [x] Integrate PrivatBank public exchange rate API.
- [x] Integrate Monobank public exchange rate API.
- [x] Implement a service that returns the appropriate buy rate for a given currency pair and selected bank.
- [x] Cache fetched exchange rates for the current day to avoid repeated API calls, since rates change only once per day.
- [x] Add fallback handling for unavailable or malformed API responses; the UI shows an error and lets the user enter the rate manually.

### Phase 3 — Transaction Form Updates

- [x] Add a currency selector with ₴, $, and € symbols to the transaction creation form.
- [x] Add a bank selector for choosing PrivatBank or Monobank.
- [x] Add an exchange-rate-to-USD input field.
- [x] Auto-fill the exchange rate input when a currency is selected, defaulting to PrivatBank.
- [x] Update the exchange rate when the selected bank changes.
- [x] Store the USD-equivalent amount when the transaction is submitted.
- [x] (Deferred) Add a user-level default bank preference in settings; kept as a future enhancement.

### Phase 4 — Dashboard and Server Actions

- [x] Update existing dashboard Server Actions to use the USD-equivalent amount for totals and analytics.
- [x] Ensure charts and summaries continue to render without visible UI changes.
- [x] Backfill or handle legacy transactions that lack USD-equivalent amounts.

### Phase 5 — Testing and Validation

- [x] Add tests for currency conversion logic and exchange rate selection.
- [x] Add tests for auto-filling the exchange rate input.
- [x] Add tests for dashboard calculations using USD-equivalent amounts.
- [x] Add tests for API failure fallback behavior.
- [x] Run type-check, lint, and tests before merging.

## Risks & Notes

- Exchange rate APIs may introduce latency or fail during form interaction; design UI feedback accordingly.
- Both bank APIs return differently shaped payloads; normalization between them needs careful handling.
- Historical transactions must retain the original exchange rate; avoid recalculating after creation.
- The dashboard relies on existing aggregation logic; switching to USD-equivalent amounts should not change visible behavior for USD-only data.
- A default bank must be selected before the user explicitly chooses one so the exchange rate input can be populated immediately.

## Definition of Done

- [x] Currencies table exists and is seeded with UAH, USD, and EUR.
- [x] Transactions table stores payment currency, exchange rate to USD, and USD-equivalent amount.
- [x] Transaction form includes working currency and bank selectors with the required symbols.
- [x] Selecting a currency auto-fills the exchange rate from the default or selected bank.
- [x] UAH and EUR transactions convert to USD using the correct buy rates.
- [x] USD transactions keep a 1:1 exchange rate.
- [x] Dashboard totals, charts, and analytics use USD-equivalent amounts.
- [x] Tests cover conversion, auto-fill, API fallback, and dashboard aggregation.
- [x] `pnpm lint && pnpm build` passes.
