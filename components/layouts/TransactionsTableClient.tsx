'use client';

import { type FC, useEffect, useState, useTransition } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/shadcn';
import { TransactionForm } from '@/components/layouts';
import { NewButton, showError } from '@/components/ui';
import { withTimeout } from '@/lib/with-timeout';
import { deleteTransactionAction } from '@/app/actions/transactions';
import { TRANSACTION_MSGS } from '@/messages';
import type { ICategory, ICategoryType, ICurrency, ITransaction } from '@/interfaces';

interface ITransactionsTableClient {
  initialTransactions: ITransaction[];
  initialCategories: ICategory[];
  initialCategoryTypes: ICategoryType[];
  currencies: ICurrency[];
}

export const TransactionsTableClient: FC<ITransactionsTableClient> = ({
  initialTransactions,
  initialCategories,
  initialCategoryTypes,
  currencies,
}) => {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions);
  const [categories] = useState<ICategory[]>(initialCategories);
  const [categoryTypes] = useState<ICategoryType[]>(initialCategoryTypes);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isShowForm, setIsShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const getCategoryDisplayName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return '-';
    const categoryType = categoryTypes.find((ct) => ct.id === category.type_id);
    if (!categoryType) return category.name;
    return `${category.name} (${categoryType.name})`;
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await withTimeout(deleteTransactionAction({ id }));
        if (result.isSuccess) {
          setTransactions(transactions.filter((t) => t.id !== id));
        } else if (result.error) {
          showError('Transactions', result.error);
        }
      } catch {
        showError('Transactions', TRANSACTION_MSGS.TIMEOUT);
      }
    });
  };

  const filteredTransactions = transactions.filter((trans) => {
    const isMatchesSearch =
      trans.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.amount.toString().includes(searchTerm);
    const isMatchesFilter = filterType === 'all' || trans.type === filterType;
    return isMatchesSearch && isMatchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Transactions</CardTitle>
            </div>
            <NewButton
              onClick={() => {
                setIsShowForm(true);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isShowForm && (
            <TransactionForm
              onSuccess={async () => {
                setIsShowForm(false);
                setEditingId(null);
                // Re-render server components to fetch fresh data
                router.refresh();
              }}
              onCancel={() => {
                setIsShowForm(false);
                setEditingId(null);
              }}
              editingId={editingId}
              editingTransaction={
                editingId ? (transactions.find((t) => t.id === editingId) ?? null) : null
              }
              categories={categories}
              currencies={currencies}
            />
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="md:w-64"
              />
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
                  }}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('income');
                  }}
                >
                  Income
                </Button>
                <Button
                  variant={filterType === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('expense');
                  }}
                >
                  Expenses
                </Button>
              </div>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={transaction.description ?? undefined}
                      >
                        {transaction.description || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getCategoryDisplayName(transaction.category_id)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === 'income'
                              ? 'bg-primary/15 text-primary border-primary/20 dark:bg-primary/25'
                              : 'bg-destructive/15 text-destructive border-destructive/20 dark:bg-destructive/25'
                          }
                        >
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span
                          className={
                            transaction.type === 'income' ? 'text-primary' : 'text-destructive'
                          }
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {currencies.find((c) => c.id === transaction.currency_id)?.symbol ?? '$'}
                          {transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit transaction"
                            onClick={() => {
                              setEditingId(transaction.id);
                              setIsShowForm(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete transaction"
                            onClick={() => {
                              handleDelete(transaction.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
