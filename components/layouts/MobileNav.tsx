'use client';

import { type FC, useMemo } from 'react';
import { useMobileNav } from '@/components/providers';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle } from '@/lib/shadcn';
import { LogoLink, NavItemLink } from '@/components/ui';
import { type INavItem, navItems, routes } from '@/config';

interface IMobileNav {
  items?: INavItem[];
}

function isNavItemActive(pathname: string, itemHref: string): boolean {
  // Dashboard overview is a prefix of every dashboard route; only match it exactly.
  if (itemHref === routes.dashboard) {
    return pathname === routes.dashboard;
  }

  return pathname.startsWith(itemHref);
}

export const MobileNav: FC<IMobileNav> = ({ items }) => {
  const { isOpen, setIsOpen } = useMobileNav();
  const pathname = usePathname();
  const resolvedItems = items ?? navItems;

  const activeMap = useMemo(
    () => new Map(resolvedItems.map((item) => [item.href, isNavItemActive(pathname, item.href)])),
    [pathname, resolvedItems]
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-[57px] items-center border-b border-border px-4">
          <LogoLink
            onClick={() => {
              setIsOpen(false);
            }}
          />
        </div>
        <div>
          {resolvedItems.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              isActive={activeMap.get(item.href) ?? false}
              onClick={() => {
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
