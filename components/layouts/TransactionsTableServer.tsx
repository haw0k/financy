import { TransactionsTableClient } from './TransactionsTableClient';
import { getTransactionsDataAction } from '@/app/actions/transactions';

export async function TransactionsTableServer() {
  const result = await getTransactionsDataAction();

  if (!result.isSuccess) {
    throw new Error(result.error);
  }

  const { transactions, categories, categoryTypes } = result.data;

  return (
    <TransactionsTableClient
      initialTransactions={transactions}
      initialCategories={categories}
      initialCategoryTypes={categoryTypes}
    />
  );
}
