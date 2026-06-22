import type { Metadata } from 'next';

import { LoginPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Login — ${siteConfig.name}`,
  description: `Sign in to your ${siteConfig.name} account`,
};

export default LoginPage;
