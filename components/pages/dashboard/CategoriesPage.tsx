import { createClient } from '@/lib/supabase/server';
import { CategoriesTable } from '@/components/layout';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage your expense categories</p>
      </div>
      <CategoriesTable userId={user?.id || ''} />
    </div>
  );
}
