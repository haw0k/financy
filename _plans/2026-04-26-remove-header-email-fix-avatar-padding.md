# Plan for Remove Email From Header And Adjust Avatar Spacing

Spec: [_specs/2026-04-26-remove-header-email-fix-avatar-padding.md](../_specs/2026-04-26-remove-header-email-fix-avatar-padding.md)
Branch: `refactor/remove-header-email-fix-avatar-padding`

## Summary

Remove the email display from the Header component and set a consistent 16px right padding from the user avatar to the container edge.

## Implementation Steps

### 1. Remove email from Header

**File: [components/layout/Header.tsx](../components/layout/Header.tsx)**

Delete the left-aligned email div:
```
- <div className="text-sm text-muted-foreground">{user?.email}</div>
```

The `user` prop is still needed — it's used for the avatar initial (`user?.email?.[0]?.toUpperCase()`) and the dropdown content, so `IHeader` interface stays unchanged.

### 2. Fix right padding to 16px

**File: [components/layout/Header.tsx](../components/layout/Header.tsx)**

Change the container padding from symmetric to asymmetric:
```
- className="flex h-14 items-center justify-between px-4 md:px-8"
+ className="flex h-14 items-center justify-between pl-4 md:pl-8 pr-4"
```

This keeps left padding unchanged (16px mobile, 32px desktop) while fixing right padding to 16px on all viewports.

## Files to Modify

| File | Action |
|---|---|
| `components/layout/Header.tsx` | Remove email div, fix padding class |

## Verification

- Run `pnpm type-check && pnpm lint`
- Visually confirm Header shows no email and avatar has 16px from right edge
