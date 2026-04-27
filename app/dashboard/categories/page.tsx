import CategoriesPage from '@/components/pages/dashboard/CategoriesPage';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Categories — ${siteConfig.name}`,
  description: 'Organize your transactions by category',
};

export default CategoriesPage;
