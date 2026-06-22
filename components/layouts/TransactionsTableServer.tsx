import { getTransactionsDataAction } from '@/app/actions/transactions';
import { TransactionsTableClient } from './TransactionsTableClient';

export async function TransactionsTableServer() {
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
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
