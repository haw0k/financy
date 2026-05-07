# Spec for Toast Notification System

branch: feat/toast-notification-system

## Summary

Create a styled toast notification system with four variants (error, warning, success, notification) and automatic Supabase `PostgresError` interception. Instead of manually calling toast on every error, the system transparently captures database errors and displays them through the styled toast component.

## Functional Requirements

- Four toast variants with distinct visual styling:
  - **Error**: red background, white text, error icon (e.g., `XCircle` from lucide-react)
  - **Warning**: yellow/orange background, dark text, warning icon (e.g., `AlertTriangle`)
  - **Success**: green background, white text, success icon (e.g., `CheckCircle`)
  - **Notification**: white background, black text, neutral/info icon (e.g., `Info`)
- Each toast variant must display a corresponding icon alongside the message
- Toasts auto-dismiss after a configurable duration
- A centralized error interceptor that wraps Supabase calls and catches `PostgresError` (and other known error types), automatically displaying an Error toast
- A convenience API (`toast.error()`, `toast.warning()`, `toast.success()`, `toast.notification()`) for manual invocation where needed
- The system must integrate with the existing shadcn/ui toast infrastructure (`useToast`, `Toaster`) already present in the project

## Possible Edge Cases

- Multiple errors occurring in rapid succession — avoid toast flood (queue or debounce)
- Network errors vs. PostgresError vs. generic JavaScript errors — distinguishable in toast text
- Empty or undefined error messages — provide a meaningful fallback message
- SSR considerations: toasts only render on the client side
- Toast overflow on very small screens — ensure text wrapping and reasonable max-width

## Acceptance Criteria

- [ ] Four toast variants render with correct background color, text color, and icon
- [ ] `toast.error(msg)` displays a red toast with error icon
- [ ] `toast.warning(msg)` displays a yellow/orange toast with warning icon
- [ ] `toast.success(msg)` displays a green toast with success icon
- [ ] `toast.notification(msg)` displays a white/black toast with info icon
- [ ] Wrapped Supabase calls automatically show error toasts on `PostgresError`
- [ ] Manual toast invocation still works alongside automatic interception
- [ ] Existing app functionality is not broken

## Open Questions

- Should automatic interception cover all Supabase queries or opt-in (e.g., via a wrapper function)? You decide.
- What is the ideal auto-dismiss duration per variant (error may need longer display)? Error should displays longer.
- Should the warning variant use yellow or orange as the background? Yellow
- Should toast messages for `PostgresError` display the raw database message or a user-friendly translation? user-friendly translation is preferable.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Each variant renders with expected styling and icon
- Toast dismisses after timeout or manual close
- Manual `toast.error/warning/success/notification` API works
- Automatic error interceptor catches `PostgresError`-like objects
- Fallback message is shown when error has no message
