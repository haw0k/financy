import type { Metadata } from 'next';

import { ErrorPage } from '@/components/pages/auth';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `Error — ${siteConfig.name}`,
  description: 'An error occurred during authentication',
};

export default ErrorPage;
