import type { Metadata } from 'next';

import { SettingsPage } from '@/components/pages/dashboard';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Settings — ${siteConfig.name}`,
  description: 'Manage your account settings',
};

export default SettingsPage;
