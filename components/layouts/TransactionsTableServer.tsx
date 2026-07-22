import { ErrorState } from '@/components/ui/ErrorState';
import { getCurrenciesAction } from '@/app/actions/currencies';
import { getTransactionsDataAction } from '@/app/actions/transactions';
import { TransactionsTableClient } from './TransactionsTableClient';

export async function TransactionsTableServer() {
  const [transactionsResult, currenciesResult] = await Promise.all([
    getTransactionsDataAction(),
    getCurrenciesAction(),
  ]);

  if (!transactionsResult.isSuccess) {
    return (
      <ErrorState
        title="Failed to load transactions"
        description={transactionsResult.error}
        retry
      />
    );
  }
  if (!currenciesResult.isSuccess) {
    return (
      <ErrorState title="Failed to load currencies" description={currenciesResult.error} retry />
    );
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
