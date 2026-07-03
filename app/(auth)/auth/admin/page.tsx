import { AdminAuthPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Admin',
  description: 'Admin authentication',
  path: '/auth/admin',
  isNoIndex: true,
});

export default AdminAuthPage;
