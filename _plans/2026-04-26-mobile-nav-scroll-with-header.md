# Plan: Make Mobile Hamburger + Logo Scroll With Header

## Context

The MobileNav hamburger button, logo, and "Financy" text use `fixed` positioning (`fixed left-4 top-3 z-50`), so they stay glued to the viewport when the page scrolls instead of scrolling with the Header. They need to be part of the Header's normal document flow.

## Changes

### 1. Create a shared mobile nav context

**File: new — `components/layout/MobileNavContext.tsx`**

A minimal context provider that shares `isOpen`/`setIsOpen` state between the trigger (in Header) and the Sheet (in MobileNav):

- `DashboardShell` client component wraps the children with context
- Exports `useMobileNav()` hook

### 2. Move trigger into Header

**File: [components/layout/Header.tsx](../components/layout/Header.tsx)**

Replace the fixed container with an inline element inside the Header's flex layout:

- Add hamburger button + logo link on the left, visible only on mobile (`md:hidden`)
- Add a flex spacer between them and the right-side items
- Use `useMobileNav()` to open the Sheet on hamburger click

### 3. Remove fixed container from MobileNav

**File: [components/layout/MobileNav.tsx](../components/layout/MobileNav.tsx)**

- Import and use `useMobileNav()` instead of local `useState`
- Remove the `fixed` container with hamburger + logo (now in Header)
- Keep the SheetContent (drawer) unchanged

### 4. Wire DashboardShell in layout

**File: [app/dashboard/layout.tsx](../app/dashboard/layout.tsx)**

- Import `DashboardShell` and wrap the layout children

## Files to Modify/Create

| File | Action |
|---|---|
| `components/layout/MobileNavContext.tsx` | **Create** — context provider + hook |
| `components/layout/MobileNav.tsx` | Use context instead of local state, remove fixed container |
| `components/layout/Header.tsx` | Add hamburger + logo on left side (mobile only) |
| `app/dashboard/layout.tsx` | Wrap with DashboardShell |
| `components/layout/index.ts` | Export DashboardShell |

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- On mobile (≤767px): hamburger + logo are inside the Header and scroll with it
- On desktop (≥768px): no visual change
- Sheet drawer still opens/closes correctly from hamburger
