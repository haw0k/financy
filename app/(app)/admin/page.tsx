import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AdminPage } from '@/components/pages/admin';

import { requireApprovedAdmin } from '@/lib/require-auth';

import { routes, siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Admin Dashboard — ${siteConfig.name}`,
  description: 'Manage user registrations and approvals',
};

export default async function AdminPageRoute() {
  const adminResult = await requireApprovedAdmin();

  if ('error' in adminResult) {
    redirect(routes.pending);
  }

  return <AdminPage />;
}
