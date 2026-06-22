import type { Metadata } from 'next';

import { SignUpPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Sign Up — ${siteConfig.name}`,
  description: `Create a new ${siteConfig.name} account`,
};

export default SignUpPage;
