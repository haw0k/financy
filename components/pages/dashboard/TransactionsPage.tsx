import { TransactionsTableServer } from '@/components/layouts';

export async function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Manage your income and expenses</p>
      </div>
      <TransactionsTableServer />
    </div>
  );
}
