import { SignUpPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';
import { siteConfig } from '@/config';

export const metadata = createMetadata({
  title: 'Sign Up',
  description: `Create a new ${siteConfig.name} account`,
  path: '/auth/sign-up',
  isNoIndex: true,
});

export default SignUpPage;
