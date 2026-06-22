import type { Metadata } from 'next';

import { TransactionsPage } from '@/components/pages/dashboard';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Transactions — ${siteConfig.name}`,
  description: 'Manage your financial transactions',
};

export default TransactionsPage;
