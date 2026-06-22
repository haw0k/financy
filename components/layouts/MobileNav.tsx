'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useMobileNav } from '@/components/providers';
import { Sheet, SheetContent, SheetTitle } from '@/lib/shadcn';
import { navItems, type INavItem } from '@/config';
import { cn } from '@/lib/utils';
import { LogoLink } from './LogoLink';
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
        <div
          className="flex h-[57px] items-center border-b border-border px-4"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <LogoLink />
        </div>
        <div>
          {resolvedItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setIsOpen(false);
                }}
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
      </SheetContent>
    </Sheet>
  );
};
