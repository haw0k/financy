# Plan for Fix DashboardNav Border, Brand Visibility, and Mobile Logo Position

Spec: `_specs/2026-04-26-nav-header-border-brand-visibility.md`
Branch: `fix/nav-header-border-brand-visibility`

## Context

Three UI issues in the dashboard layout: (1) DashboardNav has an unnecessary right border between sidebar and Header; (2) the green "Financy" brand text is hidden on screens ≤1023px due to `hidden lg:inline-block`; (3) on mobile (≤767px) the logo + app name disappear entirely — need to show them next to the MobileNav hamburger with 16px gap.

## Changes

### 1. Remove right border from DashboardNav

**File: [components/layout/DashboardNav.tsx](../components/layout/DashboardNav.tsx)**

Remove `border-r border-border` from the `<nav>` element:
```
- className="hidden border-r border-border bg-card md:block md:w-64"
+ className="hidden bg-card md:block md:w-64"
```

### 2. Always show "Financy" brand text

**File: [components/layout/DashboardNav.tsx](../components/layout/DashboardNav.tsx)**

Change the brand text class from `hidden lg:inline-block` to just `inline-block`:
```
- className="hidden font-semibold lg:inline-block"
+ className="inline-block font-semibold"
```

### 3. Add logo + brand link next to MobileNav hamburger

**File: [components/layout/MobileNav.tsx](../components/layout/MobileNav.tsx)**

Replace the single fixed hamburger button with a fixed container at the top-left that holds both the hamburger trigger and the Financy logo + name link, with 16px gap (`gap-4`) between them.

The container structure:
```tsx
<div className="fixed left-4 top-3 z-50 flex items-center gap-4 md:hidden">
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Open navigation">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <Link href="/dashboard" className="flex items-center gap-4 font-semibold">
    <Image src="/icon.svg" alt="Financy" width={32} height={32} className="h-8 w-8" />
    <span
      className="inline-block font-semibold"
      style={{ color: '#00A541', fontSize: '26px', fontWeight: 700 }}
    >
      Financy
    </span>
  </Link>
</div>
```

## Files to Modify

| File | Action |
|---|---|
| `components/layout/DashboardNav.tsx` | Remove `border-r border-border`; change brand text to always show |
| `components/layout/MobileNav.tsx` | Wrap hamburger trigger + add logo/brand link with 16px gap |

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
- Visual check: DashboardNav has no right border at ≥768px
- Visual check: "Financy" text visible at all breakpoints including 768-1023px
- Visual check: Mobile hamburger + Financy logo/text visible at ≤767px with 16px gap
