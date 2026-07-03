import { SignUpSuccessPage } from '@/components/pages/auth';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Check Your Email',
  description: 'Verify your email to complete registration',
  path: '/auth/sign-up-success',
  isNoIndex: true,
});

export default SignUpSuccessPage;
