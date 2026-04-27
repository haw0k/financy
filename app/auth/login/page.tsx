import LoginPage from '@/components/pages/auth/LoginPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Login — ${siteConfig.name}`,
  description: `Sign in to your ${siteConfig.name} account`,
};

export default LoginPage;
