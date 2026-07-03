import { AdminAuthPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Admin',
  path: '/auth/admin',
  isNoIndex: true,
});

export default AdminAuthPage;
