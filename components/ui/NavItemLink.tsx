'use client';

import { type FC } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';

import { type INavItem } from '@/config';

interface INavItemLink {
  item: INavItem;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItemLink: FC<INavItemLink> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'shine shine-subtle flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
        isActive
          ? 'bg-primary text-primary-foreground w-full rounded-none'
          : 'text-muted-foreground hover:bg-primary/25 hover:text-foreground dark:hover:bg-primary/35 dark:hover:text-white'
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
};
