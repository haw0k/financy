'use client';

import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { DashboardNav, Header, MobileNav } from '@/components/layouts';
import { DashboardShell } from '@/components/providers';
import { navItems, adminNavItems } from '@/config';
import type { FC, ReactNode } from 'react';

interface IAppShell {
  user: User;
  children: ReactNode;
}

export const AppShell: FC<IAppShell> = ({ user, children }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const resolvedItems = isAdmin ? adminNavItems : navItems;

  return (
    <DashboardShell>
      <div className="flex min-h-screen w-full">
        <DashboardNav items={resolvedItems} />
        <div className="flex-1">
          <Header user={user} />
          <main className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
        <MobileNav items={resolvedItems} />
      </div>
    </DashboardShell>
  );
};
