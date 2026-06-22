import { CategoriesTableServer } from '@/components/layouts';

export async function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <CategoriesTableServer />
    </div>
  );
}
