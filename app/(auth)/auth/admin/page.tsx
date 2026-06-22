import type { Metadata } from 'next';

import { AdminAuthPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Admin — ${siteConfig.name}`,
  description: 'Admin authentication',
};

export default AdminAuthPage;
