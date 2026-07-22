'use client';

import { type FC, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { LogoLink, NavItemLink } from '@/components/ui';
import { type INavItem, navItems, routes } from '@/config';

interface IDashboardNav {
  items?: INavItem[];
}

function isNavItemActive(pathname: string, itemHref: string): boolean {
  // Dashboard overview is a prefix of every dashboard route; only match it exactly.
  if (itemHref === routes.dashboard) {
    return pathname === routes.dashboard;
  }

  return pathname.startsWith(itemHref);
}

export const DashboardNav: FC<IDashboardNav> = ({ items }) => {
  const pathname = usePathname();
  const resolvedItems = items ?? navItems;

  const activeMap = useMemo(
    () => new Map(resolvedItems.map((item) => [item.href, isNavItemActive(pathname, item.href)])),
    [pathname, resolvedItems]
  );

  return (
    <nav className="hidden bg-card md:flex md:flex-col md:w-64">
      <div className="flex h-14 items-center border-b border-border px-4">
        <LogoLink />
      </div>
      <div className="flex-1 border-r border-border">
        {resolvedItems.map((item) => (
          <NavItemLink key={item.href} item={item} isActive={activeMap.get(item.href) ?? false} />
        ))}
      </div>
    </nav>
  );
};
