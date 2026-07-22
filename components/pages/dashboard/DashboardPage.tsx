import { DashboardOverview } from '@/components/layouts';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDashboardDataAction } from '@/app/actions/dashboard';

export async function DashboardPage() {
  const result = await getDashboardDataAction();

  if (!result.isSuccess) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState title="Failed to load dashboard" description={result.error} retry />
      </div>
    );
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
