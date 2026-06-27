# Plan: feat: Multi-Currency Support

## Spec

Link: [Multi-Currency Support](_specs/2026-06-27-multi-currency-support.md)

## Current State

The application currently stores transaction amounts as a single numeric value and uses that value directly in dashboard totals and charts. Currencies are not modeled in the database, and there is no concept of exchange rates or USD-equivalent amounts. The transaction creation form collects amount, category, date, and description, but does not offer currency or bank selection. Dashboard analytics aggregate raw transaction amounts without conversion.

## Implementation Steps

### Phase 1 — Database and Data Model

- [ ] Create the currencies table and seed it with UAH, USD, and EUR.
- [ ] Add currency, exchange rate, and USD-equivalent amount columns to the transactions table.
- [ ] Update TypeScript interfaces and schemas to include the new transaction fields.

### Phase 2 — Exchange Rate Services

- [ ] Integrate PrivatBank public exchange rate API.
- [ ] Integrate Monobank public exchange rate API.
- [ ] Implement a service that returns the appropriate buy rate for a given currency pair and selected bank.
- [ ] Cache fetched exchange rates for the current day to avoid repeated API calls, since rates change only once per day.
- [ ] Add fallback handling for unavailable or malformed API responses, using cached values when available.

### Phase 3 — Transaction Form Updates

- [ ] Add a currency selector with ₴, $, and € symbols to the transaction creation form.
- [ ] Add a bank selector for choosing PrivatBank or Monobank.
- [ ] Add an exchange-rate-to-USD input field.
- [ ] Auto-fill the exchange rate input when a currency is selected, defaulting to PrivatBank.
- [ ] Update the exchange rate when the selected bank changes.
- [ ] Store the USD-equivalent amount when the transaction is submitted.

### Phase 4 — Dashboard and Server Actions

- [ ] Update existing dashboard Server Actions to use the USD-equivalent amount for totals and analytics.
- [ ] Ensure charts and summaries continue to render without visible UI changes.
- [ ] Backfill or handle legacy transactions that lack USD-equivalent amounts.

### Phase 5 — Testing and Validation

- [ ] Add tests for currency conversion logic and exchange rate selection.
- [ ] Add tests for auto-filling the exchange rate input.
- [ ] Add tests for dashboard calculations using USD-equivalent amounts.
- [ ] Add tests for API failure fallback behavior.
- [ ] Run type-check, lint, and tests before merging.

## Risks & Notes

- Exchange rate APIs may introduce latency or fail during form interaction; design UI feedback accordingly.
- Both bank APIs return differently shaped payloads; normalization between them needs careful handling.
- Historical transactions must retain the original exchange rate; avoid recalculating after creation.
- The dashboard relies on existing aggregation logic; switching to USD-equivalent amounts should not change visible behavior for USD-only data.
- A default bank must be selected before the user explicitly chooses one so the exchange rate input can be populated immediately.

## Definition of Done

- [ ] Currencies table exists and is seeded with UAH, USD, and EUR.
- [ ] Transactions table stores payment currency, exchange rate to USD, and USD-equivalent amount.
- [ ] Transaction form includes working currency and bank selectors with the required symbols.
- [ ] Selecting a currency auto-fills the exchange rate from the default or selected bank.
- [ ] UAH and EUR transactions convert to USD using the correct buy rates.
- [ ] USD transactions keep a 1:1 exchange rate.
- [ ] Dashboard totals, charts, and analytics use USD-equivalent amounts.
- [ ] Tests cover conversion, auto-fill, API fallback, and dashboard aggregation.
- [ ] `pnpm lint && pnpm build` passes.
