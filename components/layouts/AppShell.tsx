'use client';

import type { FC, ReactNode } from 'react';

import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

import { DashboardNav, Header, MobileNav } from '@/components/layouts';
import { DashboardShell, useRoleContext } from '@/components/providers';

import { adminNavItem, navItems, routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

interface IAppShell {
  user: User;
  children: ReactNode;
}

export const AppShell: FC<IAppShell> = ({ user, children }) => {
  const pathname = usePathname();
  const { role, status } = useRoleContext();

  // Prefer the server-provided role/status so the menu matches the authenticated
  // user even when pathname-based detection lags during redirects/hydration.
  // pathname is used as a fallback when the role context has not resolved yet,
  // or when the user navigates directly to an admin route before the server-provided
  // role is refreshed.
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
