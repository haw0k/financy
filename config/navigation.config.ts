import {
  LayoutDashboard,
  type LucideIcon,
  Settings,
  ShieldCheckIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { routes } from './routes.config';

export interface INavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: INavItem[] = [
  { href: routes.dashboard, label: 'Overview', icon: LayoutDashboard },
  { href: routes.transactions, label: 'Transactions', icon: TrendingUp },
  { href: routes.categories, label: 'Categories', icon: TrendingDown },
  { href: routes.settings, label: 'Settings', icon: Settings },
];

export const adminNavItem: INavItem = { href: routes.admin, label: 'Admin', icon: ShieldCheckIcon };
