import { getCategoriesDataAction } from '@/app/actions/categories';
import { CategoriesTableClient } from './CategoriesTableClient';

export async function CategoriesTableServer() {
  const data = await getCategoriesDataAction();

  return (
    <CategoriesTableClient
      initialCategories={data.categories}
      initialCategoryTypes={data.categoryTypes}
    />
  );
}
