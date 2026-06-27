import { getTransactionsDataAction } from '@/app/actions/transactions';
import { getCurrenciesAction } from '@/app/actions/currencies';
import { TransactionsTableClient } from './TransactionsTableClient';

export async function TransactionsTableServer() {
  const [transactionsResult, currenciesResult] = await Promise.all([
    getTransactionsDataAction(),
    getCurrenciesAction(),
  ]);

  if (!transactionsResult.isSuccess) {
    throw new Error(transactionsResult.error);
  }
  if (!currenciesResult.isSuccess) {
    throw new Error(currenciesResult.error);
  }

  const { transactions, categories, categoryTypes } = transactionsResult.data;

  return (
    <TransactionsTableClient
      initialTransactions={transactions}
      initialCategories={categories}
      initialCategoryTypes={categoryTypes}
      currencies={currenciesResult.data}
    />
  );
}
