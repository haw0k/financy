import DashboardPage from '@/components/pages/dashboard/DashboardPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Dashboard — ${siteConfig.name}`,
  description: 'View your financial overview and statistics',
};

export default DashboardPage;
