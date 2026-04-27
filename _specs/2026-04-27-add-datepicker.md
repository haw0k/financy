# Spec for Add DatePicker With Shadcn Calendar And Popover

branch: feat/add-datepicker

## Summary

Replace the native `<Input type="date">` in `TransactionForm.tsx` with a proper DatePicker built from shadcn's `Calendar` and `Popover` components. This provides a consistent look and feel with the rest of the app, better cross-browser styling, and a unified date selection UX.

## Functional Requirements

- Replace `<Input type="date">` (used for transaction date) with a DatePicker composed of `Popover` + `PopoverTrigger` + `PopoverContent` + `Calendar`
- The DatePicker trigger button should display the currently selected date in a readable format (e.g., "Apr 27, 2026")
- When no date is selected, the trigger should show a placeholder (e.g., "Pick a date")
- Selecting a date from the Calendar popover closes the popover and updates the form state
- The Calendar should allow navigating between months and years
- The existing `formData.date` state and `onChange` behavior must be preserved exactly — the date value should remain an ISO date string (YYYY-MM-DD) in the form state

## Possible Edge Cases

- **Date format**: The Calendar returns a `Date` object; it must be converted to YYYY-MM-DD to match the existing form state format
- **Initial state**: The form initializes with `new Date().toISOString().split('T')[0]` — the Calendar must reflect this value on first render
- **Mobile**: On mobile, the Popover-based DatePicker might be less intuitive than the native datepicker — consider using the native input on small screens via the `useMobile` hook
- **Editing mode**: When editing an existing transaction (`editingId` is set), the date must pre-populate correctly in the Calendar

## Acceptance Criteria

- `<Input type="date">` is removed from `TransactionForm.tsx`
- A DatePicker with Calendar + Popover is used instead
- Clicking the trigger opens a Calendar popover
- Selecting a date closes the popover and updates the form
- The displayed date in the trigger is human-readable
- All existing functionality (form submission, editing) works unchanged

## Open Questions

- Should the DatePicker be extracted as a reusable component for future use? Yes, place the DatePicker to components/ui.
- Should the native date input be used as a fallback on mobile? Use Drawer from "vaul" to implement fallback.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Verify the DatePicker renders with the current date
- Verify that selecting a date updates the form state
- Verify that the popover opens and closes correctly
