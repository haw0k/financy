import { getTransactionsDataAction } from '@/app/actions/transactions';
import { TransactionsTableClient } from './TransactionsTableClient';

export async function TransactionsTableServer({ userId }: { userId: string }) {
  const data = await getTransactionsDataAction();

  return (
    <TransactionsTableClient
      userId={userId}
      initialTransactions={data.transactions}
      initialCategories={data.categories}
      initialCategoryTypes={data.categoryTypes}
    />
  );
}
