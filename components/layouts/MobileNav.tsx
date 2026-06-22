'use client';

import { usePathname } from 'next/navigation';
import { useMobileNav } from '@/components/providers';
import { Sheet, SheetContent, SheetTitle } from '@/lib/shadcn';
import { LogoLink, NavItemLink } from '@/components/ui';
import { navItems, type INavItem } from '@/config';
import { type FC } from 'react';

interface IMobileNav {
  items?: INavItem[];
}

export const MobileNav: FC<IMobileNav> = ({ items }) => {
  const { isOpen, setIsOpen } = useMobileNav();
  const pathname = usePathname();
  const resolvedItems = items ?? navItems;

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
              isActive={pathname === item.href}
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
