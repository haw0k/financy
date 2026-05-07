import AdminAuthPage from '@/components/pages/auth/AdminAuthPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Admin — ${siteConfig.name}`,
  description: 'Admin authentication',
};

export default AdminAuthPage;
