import { PendingPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Account Pending',
  description: 'Your account is pending approval',
  path: '/auth/pending',
  isNoIndex: true,
});

export default PendingPage;
