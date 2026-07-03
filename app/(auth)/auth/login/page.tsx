import { LoginPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Login',
  description: 'Sign in to your Financy account',
  path: '/auth/login',
  isNoIndex: true,
});

export default LoginPage;
