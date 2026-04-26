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
