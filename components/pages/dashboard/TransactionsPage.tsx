import { TransactionsTableServer } from '@/components/layouts';

export async function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <TransactionsTableServer />
    </div>
  );
}
