'use client';

import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { DashboardNav, Header, MobileNav } from '@/components/layouts';
import { DashboardShell, useRoleContext } from '@/components/providers';
import { navItems, adminNavItem, routes } from '@/config';
import { ERole, EProfileStatus } from '@/enums';
import type { FC, ReactNode } from 'react';

interface IAppShell {
  user: User;
  children: ReactNode;
}

export const AppShell: FC<IAppShell> = ({ user, children }) => {
  const pathname = usePathname();
  const { role, status } = useRoleContext();

  // Prefer the server-provided role/status so the menu matches the authenticated
  // user even when pathname-based detection lags during redirects/hydration.
  // Fall back to the pathname prefix as a safety net for edge cases.
  const isAdminByRole = role === ERole.Admin && status === EProfileStatus.Approved;
  const isAdminByPath = pathname.startsWith(routes.admin);
  const resolvedItems = isAdminByRole || isAdminByPath ? [adminNavItem] : navItems;

  // If the server-side role lookup failed, avoid showing the wrong menu by falling
  // back to pathname. A null role on an admin path keeps the admin item visible.
  // A null role on a dashboard path keeps the dashboard items visible.

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
