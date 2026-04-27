import TransactionsPage from '@/components/pages/dashboard/TransactionsPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Transactions — ${siteConfig.name}`,
  description: 'Manage your financial transactions',
};

export default TransactionsPage;
