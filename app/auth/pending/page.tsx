import PendingPage from '@/components/pages/auth/PendingPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Account Pending — ${siteConfig.name}`,
  description: 'Your account is pending approval',
};

export default PendingPage;
