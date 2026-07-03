import { TransactionsPage } from '@/components/pages/dashboard';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Transactions',
  description: 'Manage your financial transactions',
  path: '/dashboard/transactions',
  isNoIndex: true,
});

export default TransactionsPage;
