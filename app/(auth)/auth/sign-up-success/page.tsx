import type { Metadata } from 'next';

import { SignUpSuccessPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Check Your Email — ${siteConfig.name}`,
  description: 'Verify your email to complete registration',
};

export default SignUpSuccessPage;
