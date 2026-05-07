import SettingsPage from '@/components/pages/dashboard/SettingsPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Settings — ${siteConfig.name}`,
  description: 'Manage your account settings',
};

export default SettingsPage;
