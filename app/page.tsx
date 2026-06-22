import type { Metadata } from 'next';

import { HomePage } from '@/components/pages/HomePage';

import { siteConfig } from '@/config';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Track Your Finances`,
  description: siteConfig.description,
};

export default HomePage;
