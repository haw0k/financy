# Plan: Apply Shadcn Custom Theme

## Context

The project at `/home/haw0k/shadcn/shadcn-custom-theme` was created via the shadcn create tool with a custom olive/green color palette, `radix-nova` style. We need to port the visual theme (CSS variables, style config, font) to the financy project while keeping existing Lucide icons and project-specific customizations intact.

## Research Findings (Context7)

- **`@import "shadcn/tailwind.css"`** — Confirmed compatible with Tailwind v4 / Next.js 16. This is the standard import in the official shadcn manual installation guide for v4. The `shadcn` npm package provides this CSS file.
- **Component reinstall** — NOT needed. Existing components reference semantic CSS variables (`bg-primary`, `text-muted-foreground`, etc.). Changing the CSS variable values in `globals.css` automatically updates all components. The `style` field in `components.json` only affects newly generated components.

## Changes

### 1. `app/globals.css` — Replace CSS variables with olive/green palette

- Add `@import "shadcn/tailwind.css";` after `@import "tw-animate-css";`
- Replace all `:root` CSS variables with the source project's olive/green values (light mode)
- Replace all `.dark` CSS variables with the source's dark mode olive/green values
- Replace `@theme inline` block with the source's version (includes radius scaling like `--radius-sm: calc(var(--radius) * 0.6);`)
- Add `--font-heading` and `--font-sans` to `@theme inline` (needed for the new font setup)
- **Preserve**: `@import 'tailwindcss';`, `@import 'tw-animate-css';`, `@custom-variant dark`, `@layer base` rules, and the Firefox select/option font fix

### 2. `components.json` — Update style configuration

| Field                | Current      | New                    |
| -------------------- | ------------ | ---------------------- |
| `style`              | `"new-york"` | `"radix-nova"`         |
| `tailwind.baseColor` | `"neutral"`  | `"olive"`              |
| `iconLibrary`        | `"lucide"`   | `"lucide"` (unchanged) |

- Keep all existing `aliases` (they point to `@/lib/shadcn`)

### 3. `app/layout.tsx` — Add heading font

- Import `Roboto` from `next/font/google`
- Add `const robotoHeading = Roboto({subsets:['latin', 'cyrillic'],variable:'--font-heading'});`
- Add `robotoHeading.variable` to the `<html>` className (alongside existing font variables)
- Keep existing structure, Geist/Geist_Mono fonts, ThemeProvider, analytics script

### 4. `package.json` — Add dependencies

- Add `"shadcn": "^4.5.0"` to dependencies (provides `shadcn/tailwind.css`)
- Update `"tw-animate-css"` from `"1.3.3"` to `"^1.4.0"` (match source project)

### 5. Install

- Run `pnpm install`

## Files Modified

- `app/globals.css` — CSS variable replacement, add `@import "shadcn/tailwind.css"`
- `components.json` — Style/baseColor update
- `app/layout.tsx` — Roboto heading font import
- `package.json` — Add `shadcn` dep, bump `tw-animate-css`

## Not Modified

- `lib/utils.ts` — Identical in both projects
- `postcss.config.mjs` — Identical in both projects
- `next.config.mjs` — No theme-related differences
- shadcn UI components — Work via CSS variables, no code changes needed
- ThemeProvider component — No changes needed

## Verification

1. `pnpm install` — install new dependencies
2. `pnpm lint && pnpm build` — must pass without errors
3. Start dev server (`pnpm dev`) and visually confirm light/dark mode renders with olive/green palette
4. Check all pages: transactions, categories, settings, dashboard
5. Verify interactive elements (buttons, inputs, selects, dropdowns) are properly styled
