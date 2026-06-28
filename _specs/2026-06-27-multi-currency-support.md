# Spec for Multi-Currency Support

branch: feat/multi-currency-support

## Summary

Add support for multiple currencies in the application. The system should store a fixed list of currencies (Ukrainian hryvnia, US dollar, and euro) in the database and allow transactions to be recorded in a selected currency. Each transaction must capture the exchange rate used at the time of payment and store the equivalent amount in US dollars. Dashboard calculations should continue to operate without UI changes, using the USD-equivalent amounts as the basis for totals and analytics.

## Functional Requirements

- Store a currencies table in the database with the following initial entries:
  - Ukrainian hryvnia (UAH)
  - US dollar (USD)
  - Euro (EUR)
- Extend the transactions table to include:
  - The currency in which the payment was made
  - The exchange rate to USD captured at the time of payment
  - The payment amount converted to USD
- When creating a new transaction, the user must be able to select:
  - The payment currency
  - The bank whose exchange rate will be used (PrivatBank or Monobank)
- The currency selector on the transactions page must display the corresponding symbols: ₴ for UAH, $ for USD, and € for EUR.
- When a currency is selected, the exchange-rate-to-USD input must be automatically populated with the current rate from the selected bank, defaulting to PrivatBank when no bank is explicitly chosen.
- Fetch exchange rates from PrivatBank and Monobank public APIs.
- For payments made in UAH, use the USD buy rate to convert the amount to USD.
- For payments made in EUR, use the EUR buy rate to convert the amount to USD.
- For payments already in USD, no exchange conversion is needed; the exchange rate input should default to 1.
- Use the USD-equivalent amount for all dashboard calculations, charts, and totals without changing the dashboard UI.
- Persist the selected currency, exchange rate, and USD-equivalent amount alongside the transaction record.

## Possible Edge Cases

- Exchange rate APIs are unavailable or return malformed data.
- Selected bank API does not provide the required currency pair rate.
- Transaction amount or exchange rate yields a fractional USD value.
- User changes currency or bank selection before submitting the transaction.
- Historical transactions need to retain the original exchange rate even if current rates change.
- Storing a currency with zero or negative exchange rate.
- Unsupported currency selected by mistake due to stale client state.

## Acceptance Criteria

- [x] A currencies table exists with UAH, USD, and EUR records.
- [x] Transactions table has columns for payment currency, exchange rate to USD, and USD-equivalent amount.
- [x] Transaction creation form includes currency and bank selectors.
- [x] Currency selector displays ₴ for UAH, $ for USD, and € for EUR.
- [x] Selecting a currency auto-fills the exchange-rate-to-USD input using the current rate from the selected bank (PrivatBank by default).
- [x] Selecting UAH fetches and uses the USD buy rate from the chosen bank.
- [x] Selecting EUR fetches and uses the EUR buy rate from the chosen bank.
- [x] USD transactions keep exchange rate as 1 and USD amount equal to the entered amount.
- [x] Dashboard totals, charts, and analytics use the stored USD-equivalent amounts.
- [x] Exchange rates are fetched from PrivatBank and Monobank public APIs based on the selected bank.
- [x] The original transaction currency, exchange rate, and USD amount are persisted and remain unchanged after creation.

## Open Questions

- Should exchange rates be cached for a short period to reduce API calls? exchange rates should be cached because they changed on daily basis.
- How should the UI behave when a selected bank API is temporarily unavailable? No - just show an error. User can manually type a rate into the input.
- Should the system allow editing the exchange rate manually when an API fails? Yes
- Is there a preferred bank order or default bank when creating a transaction? We neet the setting for a preferred bank in settings page.
- Should the currencies table be seeded via migration or application startup script? application startup script
- Should exchange rates be recorded with a timestamp separate from the transaction date? no
- Should the exchange rate input remain editable after it is auto-filled from a bank API? yes
- Should there be a user-level default bank preference in the settings page? Deferred — not required for the initial multi-currency release. PrivatBank remains the hardcoded default provider.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Currency conversion logic for UAH and EUR to USD using the correct buy rates.
- USD transactions do not apply conversion.
- Selecting a currency auto-fills the exchange rate input with the bank rate. The default bank must be is set in settings. Privatbank is default for settings.
- Switching banks updates the auto-filled exchange rate.
- Fallback behavior when exchange rate APIs fail or return invalid data.
- Transaction form validates required currency and bank fields.
- Dashboard calculations use the USD-equivalent amount instead of the raw transaction amount.
