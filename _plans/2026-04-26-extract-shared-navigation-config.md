# Plan: Extract Shared Navigation Config

Spec: `_specs/2026-04-26-extract-shared-navigation-config.md`
Branch: `refactor/extract-shared-navigation-config`

## Changes

### 1. Create `config/navigation.ts`

New file with the nav items array and a typed interface:

```ts
import { LayoutDashboard, TrendingUp, TrendingDown, Settings, type LucideIcon } from 'lucide-react';

export interface INavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: INavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: TrendingUp },
  { href: '/dashboard/categories', label: 'Categories', icon: TrendingDown },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];
```

### 2. Update `DashboardNav.tsx`

- Remove local `navItems` array
- Add `import { navItems } from '@/config/navigation';`
- Remove unused lucide-react icon imports

### 3. Update `MobileNav.tsx`

- Remove local `navItems` array
- Add `import { navItems } from '@/config/navigation';`
- Remove unused lucide-react icon imports

## Verification

- `pnpm type-check && pnpm lint && pnpm build`
