import { CategoriesPage } from '@/components/pages/dashboard';
import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Categories',
  description: 'Organize your transactions by category',
  path: '/dashboard/categories',
  isNoIndex: true,
});

export default CategoriesPage;
