'use client';

import { type FC } from 'react';
import { usePathname } from 'next/navigation';
import { LogoLink, NavItemLink } from '@/components/ui';
import { type INavItem, navItems } from '@/config';

interface IDashboardNav {
  items?: INavItem[];
}

export const DashboardNav: FC<IDashboardNav> = ({ items }) => {
  const pathname = usePathname();
  const resolvedItems = items ?? navItems;

  return (
    <nav className="hidden bg-card md:flex md:flex-col md:w-64">
      <div className="flex h-14 items-center border-b border-border px-4">
        <LogoLink />
      </div>
      <div className="flex-1 border-r border-border">
        {resolvedItems.map((item) => (
          <NavItemLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
};
