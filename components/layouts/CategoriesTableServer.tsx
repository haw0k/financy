import { ErrorState } from '@/components/ui/ErrorState';
import { getCategoriesDataAction } from '@/app/actions/categories';
import { CategoriesTableClient } from './CategoriesTableClient';

export async function CategoriesTableServer() {
  const result = await getCategoriesDataAction();

  if (!result.isSuccess) {
    return <ErrorState title="Failed to load categories" description={result.error} retry />;
  }

  const { categories, categoryTypes } = result.data;

  return (
    <CategoriesTableClient initialCategories={categories} initialCategoryTypes={categoryTypes} />
  );
}
