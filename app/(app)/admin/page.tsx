import { AdminPage } from '@/components/pages/admin';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Admin Dashboard — ${siteConfig.name}`,
  description: 'Manage user registrations and approvals',
};

export default AdminPage;
