import { CategoriesTableClient } from './CategoriesTableClient';
import { getCategoriesDataAction } from '@/app/actions/categories';

export async function CategoriesTableServer() {
  const result = await getCategoriesDataAction();

  if (!result.isSuccess) {
    throw new Error(result.error);
  }

  const { categories, categoryTypes } = result.data;

  return (
    <CategoriesTableClient initialCategories={categories} initialCategoryTypes={categoryTypes} />
  );
}
