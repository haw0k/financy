import { SettingsPage } from '@/components/pages/dashboard';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Settings',
  description: 'Manage your account settings',
  path: '/dashboard/settings',
  noIndex: true,
});

export default SettingsPage;
