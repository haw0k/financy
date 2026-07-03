import { ErrorPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Error',
  description: 'An error occurred during authentication',
  path: '/auth/error',
  isNoIndex: true,
});

export default ErrorPage;
