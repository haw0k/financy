import ErrorPage from '@/components/pages/auth/ErrorPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Error — ${siteConfig.name}`,
  description: 'An error occurred during authentication',
};

export default ErrorPage;
