# Plan: feat: Improve Transaction Form Layout

## Spec

Link: [Improve Transaction Form Layout](_specs/2026-06-28-improve-transaction-form-layout.md)

## Current State

`components/layouts/TransactionForm.tsx` renders every field inside one `md:grid-cols-2` container. The form contains:

- `Amount`
- `Currency`
- `Rate provider`
- `Exchange rate to USD`
- `Amount in USD`
- `Type`
- `Date`
- `Receiver`
- `Category`
- `Description`

Labels are the default shadcn `Label` size (`text-sm font-medium`). The `Type` field uses a `Select`. The rate provider and exchange rate each occupy their own full-width field rows. This makes the form look dense and hard to scan quickly.

All server-action logic in `app/actions/transactions.ts` and the `transactionSchema` remain correct; only the presentation layer in `TransactionForm.tsx` needs to change.

## Target Layout

```
┌─ Add New Transaction ───────────────────────┐
│                                             │
│  Amount                                     │
│  [ Amount ] [ Currency ] [ Amount in USD ]  │
│              PrivatBank  [ 41.50 ] UAH/USD  │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Details                                    │
│  [ Expense | Income ]                       │
│  [ Category (optional)    ]                 │
│  [ Receiver               ]                 │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Date & note                                │
│  [ Date picker ]                            │
│  [ Description (optional)                 ] │
│                                             │
│  [ Add Transaction ] [ Cancel ]             │
└─────────────────────────────────────────────┘
```

## Implementation Steps

### Phase 1 — Restructure the form layout

- [ ] Replace the single `md:grid-cols-2` wrapper with three semantic sections separated by `Separator`.
- [ ] Section **Amount**:
  - Three-column desktop row: `Amount` input, `Currency` select, `Amount in USD` input (read-only).
  - Compact inline row under `Amount in USD` containing a small provider `Select` and an editable exchange-rate `Input`.
- [ ] Section **Details**:
  - `Type` toggle group (`Expense` / `Income`).
  - `Category` select (if categories exist).
  - `Receiver` select (if receivers exist).
- [ ] Section **Date & note**:
  - `Date` picker.
  - `Description` input (full width).

### Phase 2 — Apply visual hierarchy

- [ ] Add `text-xs text-muted-foreground` styling to all field labels.
- [ ] Add section headings (`text-sm font-medium text-foreground`).
- [ ] Ensure responsive behavior for the three-column Amount row (stack or wrap on narrow screens).
- [ ] Hide or disable the exchange-rate inline input when USD is selected.

### Phase 3 — Verify behavior and quality

- [ ] Confirm exchange-rate auto-fetch still triggers on currency/provider changes.
- [ ] Confirm manual exchange-rate edits are preserved.
- [ ] Run `pnpm lint`.
- [ ] Run `pnpm type-check`.
- [ ] Run `pnpm test:run`.
- [ ] Run `pnpm build`.
- [ ] Update `_specs/_description.md` and `_plans/_description.md` to mark the feature complete.

## Risks & Notes

- The compact inline exchange-rate input must remain accessible; keep a real `Label` (visually hidden if needed) and proper `id`/`htmlFor` links.
- Mobile layout: three columns may be too narrow. Use responsive grid breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) or allow wrapping.
- Keep the existing `formData` shape and submission payload so server actions and tests are unaffected.
- The `ToggleGroup` component is already available in `lib/shadcn`; import it instead of `Select` for the type field.

## Definition of Done

- [ ] Form matches the three-section layout described in the spec.
- [ ] `Type` is a toggle group, `Rate provider` is not a full-width field, and labels are smaller/secondary.
- [ ] Exchange-rate provider switch and editable rate are available in the compact row under `Amount in USD`.
- [ ] Auto-fetch, validation, create, and update flows still work.
- [ ] All quality checks (`lint`, `type-check`, `test:run`, `build`) pass.
- [ ] Description index files are updated.
