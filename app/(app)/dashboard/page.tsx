import { DashboardPage } from '@/components/pages/dashboard';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Dashboard',
  description: 'View your financial overview and statistics',
  path: '/dashboard',
  noIndex: true,
});

export default DashboardPage;
