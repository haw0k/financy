# Plan: feat: Polish Application Styling With Frontend-Design Plugin

## Spec

Link: [Polish Application Styling With Frontend-Design Plugin](../_specs/2026-06-21-frontend-design-styling.md)

## Context

Financy uses Tailwind CSS v4 with shadcn/ui in the `radix-nova` style. Theme tokens live in `app/globals.css` as CSS variables, and fonts are loaded via `next/font/google` in `app/layout.tsx`. The project already has a custom shadcn green theme, but the TODO.md Styling section notes that buttons, cards, fonts, and colors still need refinement.

The `frontend-design` plugin should drive the visual direction: it can propose a coherent token set and component-level tweaks that are then applied to the existing Tailwind/shadcn setup without replacing components or changing behavior.

## Current State

- `app/globals.css` — Tailwind v4 theme with `:root` and `.dark` CSS variables, custom radius scale, autofill fixes.
- `app/layout.tsx` — loads `Geist`, `Geist_Mono`, and `Roboto` (heading variable) fonts.
- `components.json` — shadcn configured with `style: radix-nova`, `baseColor: green`, CSS variables enabled.
- `lib/shadcn/Button.tsx` and `lib/shadcn/Card.tsx` — shadcn `radix-nova` variants (PascalCase filenames).
- Auth pages, dashboard pages, admin page use these components via `@/lib/shadcn` and custom page components.
- No separate Tailwind config file (Tailwind v4 is configured through CSS).

## Design Decisions

1. **Plugin usage**: Use the `frontend-design` plugin to generate an updated color/typography/spacing direction. Apply the output by editing CSS variables and component class names, not by regenerating shadcn components.
2. **Scope**: restrict changes to:
   - `app/globals.css` theme variables (`--primary`, `--secondary`, `--card`, `--background`, font/radius tokens).
   - `lib/shadcn/Button.tsx` variants (sizes, radius, shadows, hover/focus transitions).
   - `lib/shadcn/Card.tsx` spacing, border, shadow, radius.
   - `app/layout.tsx` only if font pairing or heading font needs adjustment.
3. **No behavior changes**: keep all interactions, redirects, form logic, and data flow intact.
4. **Theme compatibility**: every color change must provide matching `.dark` overrides and maintain WCAG 2.1 AA contrast for normal text.
5. **Component naming**: preserve PascalCase shadcn filenames and Hungarian-notation-friendly prop names where already present.

## Implementation Steps

### Phase 1 — Audit current styling

- [ ] Read and document current `app/globals.css` variable values for both light and dark themes.
- [ ] Inspect `lib/shadcn/Button.tsx` variants and identify inconsistencies (size, radius, transitions, focus ring).
- [ ] Inspect `lib/shadcn/Card.tsx` spacing, border, shadow usage.
- [ ] List all direct `className` overrides in auth/dashboard/admin page components that could conflict with new tokens.
- [ ] Confirm `frontend-design` plugin inputs and output format.

### Phase 2 — Generate design direction with frontend-design plugin

- [ ] Run the `frontend-design` plugin against the current Financy UI screenshots or component list.
- [ ] Capture proposed color palette, font scale, radius scale, shadow scale, and button/card recommendations.
- [ ] Validate that proposed colors map cleanly to existing CSS variable slots (`--primary`, `--secondary`, `--card`, etc.).
- [ ] Decide whether to adopt the full proposal or a subset; document the decision.

### Phase 3 — Update global theme tokens

- [ ] Adjust `:root` CSS variables for background, foreground, card, primary, secondary, muted, accent, border, input, ring.
- [ ] Adjust corresponding `.dark` CSS variables.
- [ ] Update radius scale if the design direction recommends a different base radius.
- [ ] Verify autofill fix still matches updated `--background` / `--foreground`.
- [ ] Add or refine transition utilities if needed (e.g., color, shadow transitions).

### Phase 4 — Refine Button and Card components

- [ ] Update `lib/shadcn/Button.tsx` base and variant class names for improved sizing, radius, and hover/focus states.
- [ ] Update `lib/shadcn/Card.tsx` header, content, footer, and title spacing/shadows/borders.
- [ ] Ensure destructive and outline variants remain accessible after color changes.
- [ ] Keep the component API unchanged so existing imports continue to work.

### Phase 5 — Page-level consistency pass

- [ ] Review auth page wrappers and cards for visual consistency with new tokens.
- [ ] Review dashboard stat cards, tables, and forms for spacing regressions.
- [ ] Review admin pending-users cards/buttons for spacing regressions.
- [ ] Remove any hardcoded color/shadow class names that now duplicate or fight with the theme.

### Phase 6 — Verification and tests

- [ ] Run `pnpm lint` and fix any class-order or formatting issues.
- [ ] Run `pnpm type-check`.
- [ ] Run `pnpm build`.
- [ ] Manual smoke test: light theme auth flow, dashboard navigation, dark theme toggle.
- [ ] Add or update visual regression tests for Button and Card variants in both themes.

### Phase 7 — Update project indexes

- [ ] Mark `_specs/_description.md` item complete.
- [ ] Mark `_plans/_description.md` item complete.
- [ ] Mark `TODO.md` Styling item complete.

## Files Summary

| Action | File |
| ------ | ---- |
| MODIFY | `app/globals.css` |
| MODIFY | `lib/shadcn/Button.tsx` |
| MODIFY | `lib/shadcn/Card.tsx` |
| MAYBE MODIFY | `app/layout.tsx` (if font changes) |
| MAYBE MODIFY | Various page components in `components/pages/**` |
| MODIFY | `TODO.md` |
| MODIFY | `_specs/_description.md` |
| MODIFY | `_plans/_description.md` |
| CREATE | Visual/regression tests in `tests/` |

## Risks & Notes

- Tailwind v4 does not use a JS config file; all theme changes go through CSS. The `frontend-design` plugin may expect a `tailwind.config.ts` — if so, map recommendations to CSS variables and `@theme inline` blocks instead.
- Dark theme contrast is easy to break when changing muted/accent colors; verify with dev tools or a contrast checker.
- The `radix-nova` shadcn style has specific non-default class names; review the file before editing rather than copying from standard shadcn docs.
- Some page components may use hardcoded utility classes (e.g., `shadow-sm`, `rounded-lg`). A pass is needed to keep them consistent with the new base radius/shadow scale.

## Definition of Done

- [ ] `frontend-design` plugin output is applied to `app/globals.css` and core components.
- [ ] Buttons, cards, fonts, and colors are visibly improved and consistent across pages.
- [ ] No functional regressions in auth, dashboard, admin, or settings flows.
- [ ] Light/dark themes and responsive breakpoints are verified.
- [ ] `pnpm lint`, `pnpm type-check`, and `pnpm build` pass.
- [ ] `TODO.md` Styling item is checked off.
- [ ] `_specs/_description.md` and `_plans/_description.md` items are marked complete.
