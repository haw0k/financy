# Plan for Fix DashboardNav Visibility On Mobile Breakpoint

Spec: [_specs/2026-04-26-dashboardnav-mobile-visibility.md](../_specs/2026-04-26-dashboardnav-mobile-visibility.md)
Branch: `fix/dashboardnav-mobile-visibility`

## Summary

Add a mobile slide-in drawer (hamburger menu) using the existing shadcn `Sheet` component so `DashboardNav` is accessible at viewports ≤767px. The desktop sidebar remains unchanged.

## Implementation Steps

### 1. Fix `useIsMobile` hook

**File: [hooks/useMobile.ts](../hooks/useMobile.ts)**

The `subscribe` function returns a no-op cleanup — the hook never re-subscribes to resize events, so it always returns the initial (SSR) value `false`. Fix it:

- Add a real `subscribe` that listens to `resize` on `window` and calls the `onStoreChange` callback
- The `getSnapshot` and `getServerSnapshot` already read `window.innerWidth`, so once subscriptions work, the hook will correctly return `true`/`false` as the viewport changes

### 2. Add hamburger button and Sheet to dashboard layout

**File: [app/dashboard/layout.tsx](../app/dashboard/layout.tsx)**

This is a server component, so we need a new client component wrapper for the mobile nav. Create:

**File: [components/layout/MobileNav.tsx](../components/layout/MobileNav.tsx)**

- `'use client'` component
- Uses `useIsMobile()` to know when to show the hamburger button
- Uses shadcn `Sheet`, `SheetTrigger`, `SheetContent`, `SheetTitle` from `@/lib/shadcn`
- On mobile (≤767px): show a hamburger icon (`Menu` from lucide-react) in the header area
- Sheet slides in from the left, contains the same nav items and branding as `DashboardNav`
- Sheet closes on nav item click
- `SheetTitle` with "Navigation" (sr-only for accessibility)
- On desktop: render nothing (the existing `DashboardNav` handles it)

### 3. Update dashboard layout to include MobileNav

**File: [app/dashboard/layout.tsx](../app/dashboard/layout.tsx)**

- Add `MobileNav` component alongside existing `DashboardNav` and `Header`
- Place hamburger button inside the `Header` or as a sibling above it on mobile

### 4. Optional — wire hamburger into Header

**File: [components/layout/Header.tsx](../components/layout/Header.tsx)**

- Add a `Menu` button at the left side of the header on mobile
- It triggers the Sheet via a shared state (lift state to layout or use a simple context/trigger pattern)
- Alternative: render the `SheetTrigger` as the hamburger in the header area directly

### 5. Verify no regressions

- Desktop (≥768px): sidebar nav is visible, no changes
- Mobile (≤767px): hamburger icon visible, Sheet opens/closes correctly
- Navigation links work, Sheet closes on selection
- Touch targets are ≥44x44px

## Files to Modify

| File | Action |
|---|---|
| `hooks/useMobile.ts` | Fix `subscribe` to listen to resize events |
| `components/layout/MobileNav.tsx` | **Create** — mobile sheet navigation |
| `app/dashboard/layout.tsx` | Add `MobileNav` to layout |
| `components/layout/Header.tsx` | Add hamburger trigger button (optional, could be in MobileNav itself) |

## Open Questions

- Should the hamburger live inside `Header` or in a standalone wrapper in the layout? **Decision:** Keep it in `MobileNav` as a self-contained component that renders the trigger button + Sheet together.
