import { SignUpPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Sign Up',
  description: 'Create a new Financy account',
  path: '/auth/sign-up',
  noIndex: true,
});

export default SignUpPage;
