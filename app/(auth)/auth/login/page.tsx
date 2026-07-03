import { LoginPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';
import { siteConfig } from '@/config';

export const metadata = createMetadata({
  title: 'Login',
  description: `Sign in to your ${siteConfig.name} account`,
  path: '/auth/login',
  isNoIndex: true,
});

export default LoginPage;
