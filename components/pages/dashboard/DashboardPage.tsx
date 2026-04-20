import { createClient } from '@/lib/supabase/server';
import { DashboardOverview } from '@/components/layout';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email}</p>
      </div>
      <DashboardOverview userId={user?.id || ''} />
    </div>
  );
}