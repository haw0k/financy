'use client';

import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { DashboardNav, Header, MobileNav } from '@/components/layouts';
import { DashboardShell, useRoleContext } from '@/components/providers';
import { navItems, routes } from '@/config';
import { ERole, EProfileStatus } from '@/enums';
import { ShieldCheckIcon } from 'lucide-react';
import type { FC, ReactNode } from 'react';

interface IAppShell {
  user: User;
  children: ReactNode;
}

const adminNavItem = { href: routes.admin, label: 'Admin', icon: ShieldCheckIcon };

export const AppShell: FC<IAppShell> = ({ user, children }) => {
  const pathname = usePathname();
  const { role, status } = useRoleContext();

  // Prefer the server-provided role/status so the menu matches the authenticated
  // user even when pathname-based detection lags during redirects/hydration.
  // Fall back to the pathname prefix as a safety net for edge cases.
  const isAdminByRole = role === ERole.Admin && status === EProfileStatus.Approved;
  const isAdminByPath = pathname.startsWith(routes.admin);
  const resolvedItems = isAdminByRole || isAdminByPath ? [adminNavItem] : navItems;

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
