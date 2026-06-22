import { createClient } from '@/lib/supabase/server';
import { DashboardOverview } from '@/components/layouts';
import { getDashboardDataAction } from '@/app/actions/dashboard';

export async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getDashboardDataAction();

  if (!result.isSuccess) {
    throw new Error(result.error);
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <DashboardOverview
        transactions={result.data.transactions}
        stats={result.data.stats}
        statsError={result.data.statsError}
      />
    </div>
  );
}
