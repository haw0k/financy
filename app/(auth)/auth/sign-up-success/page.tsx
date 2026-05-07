import SignUpSuccessPage from '@/components/pages/auth/SignUpSuccessPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Check Your Email — ${siteConfig.name}`,
  description: 'Verify your email to complete registration',
};

export default SignUpSuccessPage;
