'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { navItems, type INavItem } from '@/config';
import { LogoLink } from './LogoLink';
import { type FC } from 'react';

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
        {resolvedItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative isolate flex items-center gap-3 overflow-hidden px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] after:absolute after:inset-0 after:-z-10 after:translate-x-[-100%] after:bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,.2)_50%,transparent_70%)] after:transition-transform after:duration-500 hover:after:translate-x-[100%]',
                isActive
                  ? 'bg-primary text-primary-foreground w-full rounded-none'
                  : 'text-muted-foreground hover:bg-primary/25 hover:text-foreground dark:hover:bg-primary/35 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
