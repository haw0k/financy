import { redirect } from 'next/navigation';
import { AdminPage } from '@/components/pages/admin';
import { createMetadata } from '@/lib/metadata';
import { requireApprovedAdmin } from '@/lib/require-auth';
import { routes } from '@/config';

export const metadata = createMetadata({
  title: 'Admin Dashboard',
  description: 'Manage user registrations and approvals',
  path: '/admin',
  isNoIndex: true,
});

export default async function AdminPageRoute() {
  const adminResult = await requireApprovedAdmin();

  if ('error' in adminResult) {
    redirect(routes.pending);
  }

  return <AdminPage />;
}
