# Spec for Move Theme Toggle to Settings Page

branch: feat/move-theme-toggle-to-settings

## Summary

Replace the theme toggle buttons in the Header and MobileNav with a theme selector (select) on the Settings page. The select will have three options: System (default), Light, and Dark, using `next-themes`'s `useTheme` hook.

## Functional Requirements

- Add a theme `<Select>` component to the Settings page with three options:
  - **System** — follows the OS-level `prefers-color-scheme` (default)
  - **Light** — forces light mode
  - **Dark** — forces dark mode
- The select must read the current theme via `useTheme().theme` and update via `useTheme().setTheme`
- Remove the theme toggle button (Sun/Moon icon) from the Header component
- Remove the theme toggle button (Sun/Moon icon) from the MobileNav component
- Clean up any unused imports (Sun, Moon, useTheme from the removed locations)

## Possible Edge Cases

- The Settings page is a server component (`SettingsPage.tsx` currently renders server-side). The theme select requires `useTheme` from `next-themes`, which is client-side only. The Settings page may need to be split or a client wrapper component created.
- When the select is set to "system" and the OS preference changes, the theme should follow automatically (handled by `next-themes` with `enableSystem`)
- Empty/missing theme value — select should default to "system"

## Acceptance Criteria

- Settings page displays a `<Select>` with options: System, Light, Dark
- Changing the select value immediately switches the theme
- The current theme is reflected in the select value on page load
- Header no longer has a theme toggle button
- MobileNav no longer has a theme toggle button
- `pnpm type-check` and `pnpm lint` pass without errors

## Open Questions

- Should the theme select label display in the "Account Information" card or as a separate card? Make a separate "System" card at the top of the page.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Settings page renders theme select with three options
- Selecting an option calls `setTheme` with the correct value
- Header does not render a theme toggle button
- MobileNav does not render a theme toggle button
