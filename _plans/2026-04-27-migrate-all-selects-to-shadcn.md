# Plan: Migrate All Selects To Shadcn Select

Spec: `_specs/2026-04-27-migrate-all-selects-to-shadcn.md`
Branch: `refactor/migrate-all-selects-to-shadcn`

## Context

Three components use native `<select>` elements with Tailwind classes that manually replicate shadcn styling. They need to be replaced with `Select` from `@/lib/shadcn` for consistent theming, accessibility, and behavior.

Native selects to replace (5 total):

- `SignUpPage.tsx` — role selector (sender/receiver)
- `TransactionForm.tsx` — transaction type (expense/income) and receiver selector
- `CategoriesTable.tsx` — category type (expense/income) and category type selector

## Design Decisions

- **`w-full` on triggers**: The native selects use `w-full`. shadcn `SelectTrigger` defaults to `w-fit`. In all 3 components, selects are in grid/flex layouts with labels above, so `w-full` is appropriate for the trigger.
- **Controlled pattern**: All native selects use controlled state (`value`/`onChange`). shadcn Select supports the same pattern via `value`/`onValueChange` on `Select.Root`.
- **Form submission**: All forms use React state + Supabase directly (not `FormData`), so no hidden inputs needed.
- **Placeholder**: Replace `<option value="">Select receiver</option>` with `SelectValue placeholder="Select receiver"`.

## Changes

### 1. Update `SignUpPage.tsx`

- Add imports: `Select, SelectTrigger, SelectValue, SelectContent, SelectItem` from `@/lib/shadcn`
- Replace native `<select>` with shadcn Select:
  ```tsx
  <Select value={role} onValueChange={(v) => setRole(v as 'sender' | 'receiver')}>
    <SelectTrigger className="w-full" id="role">
      <SelectValue placeholder="Select account type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="sender">Sender (Send Money)</SelectItem>
      <SelectItem value="receiver">Receiver (Receive Money)</SelectItem>
    </SelectContent>
  </Select>
  ```
- Remove the native `<select>` className and its `<option>` children

### 2. Update `TransactionForm.tsx`

- Add imports: `Select, SelectTrigger, SelectValue, SelectContent, SelectItem` from `@/lib/shadcn`
- Replace transaction type `<select>` with shadcn Select:
  ```tsx
  <Select
    value={formData.type}
    onValueChange={(v) => setFormData({ ...formData, type: v as 'income' | 'expense' })}
  >
    <SelectTrigger className="w-full" id="type">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="expense">Expense</SelectItem>
      <SelectItem value="income">Income</SelectItem>
    </SelectContent>
  </Select>
  ```
- Replace receiver `<select>` with shadcn Select:
  ```tsx
  <Select
    value={formData.receiverId}
    onValueChange={(v) => setFormData({ ...formData, receiverId: v })}
  >
    <SelectTrigger className="w-full" id="receiver">
      <SelectValue placeholder="Select receiver" />
    </SelectTrigger>
    <SelectContent>
      {users.map((user) => (
        <SelectItem key={user.id} value={user.id}>
          {user.email}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  ```

### 3. Update `CategoriesTable.tsx`

- Add imports: `Select, SelectTrigger, SelectValue, SelectContent, SelectItem` from `@/lib/shadcn`
- Replace category type `<select>` (expense/income) with shadcn Select:
  ```tsx
  <Select
    value={formData.type}
    onValueChange={(v) => setFormData({ ...formData, type: v as 'income' | 'expense' })}
  >
    <SelectTrigger className="w-full" id="type">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="expense">Expense</SelectItem>
      <SelectItem value="income">Income</SelectItem>
    </SelectContent>
  </Select>
  ```
- Replace category type selector (from category_types table) with shadcn Select:
  ```tsx
  <Select value={formData.type_id} onValueChange={(v) => setFormData({ ...formData, type_id: v })}>
    <SelectTrigger className="w-full" id="type_id">
      <SelectValue placeholder="Select type (optional)" />
    </SelectTrigger>
    <SelectContent>
      {categoryTypes.map((ct) => (
        <SelectItem key={ct.id} value={ct.id}>
          {ct.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  ```

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- Each replaced select renders correctly with the same options
- Form submission works in signup, transaction add/edit, and category add/edit
- No regressions in layout (selects maintain full-width in their containers)
