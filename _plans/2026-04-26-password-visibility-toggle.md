# Plan: Password Visibility Toggle for Login and Signup Pages

branch: feat/password-visibility-toggle

## Context

Password fields on the Login and Signup pages currently have no way for users to see what they typed. This adds an eye-icon toggle inside each password field so users can show/hide the password text. A reusable `PasswordField` component will be created to avoid duplicating the `InputGroup` pattern across pages.

## Changes

### 1. New: `components/ui/PasswordField.tsx`

A reusable wrapper component that renders an `InputGroup` with:

- `InputGroupInput` for the actual input
- `InputGroupAddon` + `InputGroupButton` with `Eye`/`EyeOff` toggle at the inline-end

Props: extend `React.ComponentProps<'input'>` plus an optional `showPassword`/`onToggle` pattern internally managed via `useState`.

Accepts and passes through `className`, `placeholder`, `id`, `required`, `value`, `onChange`, etc. to `InputGroupInput`.

### 2. New: `components/ui/index.ts`

Barrel file that re-exports `PasswordField` (and any future UI components).

### 3. Update `LoginPage` ([components/pages/auth/LoginPage.tsx](components/pages/auth/LoginPage.tsx))

- Remove direct `InputGroup` imports and `showPassword` state
- Import `PasswordField` from `@/components/ui`
- Replace the password `<div>` block with `<PasswordField id="password" ... />`

### 4. Update `SignUpPage` ([components/pages/auth/SignUpPage.tsx](components/pages/auth/SignUpPage.tsx))

- Remove direct `InputGroup` imports and `showPassword`/`showRepeatPassword` states
- Import `PasswordField` from `@/components/ui`
- Replace both password `<div>` blocks with `<PasswordField id="password" ... />` and `<PasswordField id="repeat-password" ... />`

## Files to Create

- [components/ui/PasswordField.tsx](components/ui/PasswordField.tsx)
- [components/ui/index.ts](components/ui/index.ts)

## Files to Modify

- [components/pages/auth/LoginPage.tsx](components/pages/auth/LoginPage.tsx)
- [components/pages/auth/SignUpPage.tsx](components/pages/auth/SignUpPage.tsx)

## Verification

1. Run `pnpm dev` and open `/auth/login` — eye toggle works on password field
2. Open `/auth/sign-up` — both Password and Repeat Password fields have independent toggles
3. Form submission still works on both pages
4. Run `pnpm lint` and `pnpm type-check`
