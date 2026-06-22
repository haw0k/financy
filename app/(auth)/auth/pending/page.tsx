import type { Metadata } from 'next';

import { PendingPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Account Pending — ${siteConfig.name}`,
  description: 'Your account is pending approval',
};

export default PendingPage;
