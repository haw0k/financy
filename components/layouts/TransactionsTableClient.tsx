'use client';

import { type FC, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { showError } from '@/components/ui';
import { deleteTransactionAction } from '@/app/actions/transactions';
import { withTimeout } from '@/lib/with-timeout';
import { TRANSACTION_MSGS } from '@/messages';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/shadcn';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { TransactionForm } from '@/components/layouts';
import type { ITransaction, ICategory, ICategoryType } from '@/interfaces';

interface ITransactionsTableClient {
  initialTransactions: ITransaction[];
  initialCategories: ICategory[];
  initialCategoryTypes: ICategoryType[];
}

export const TransactionsTableClient: FC<ITransactionsTableClient> = ({
  initialTransactions,
  initialCategories,
  initialCategoryTypes,
}) => {
  const [transactions, setTransactions] = useState<ITransaction[]>(initialTransactions);
  const [categories] = useState<ICategory[]>(initialCategories);
  const [categoryTypes] = useState<ICategoryType[]>(initialCategoryTypes);
  const [searchTerm, setSearchTerm] = useState('');
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
              <CardTitle>Transactions</CardTitle>
              <CardDescription>View and manage all your transactions</CardDescription>
            </div>
            <Button
              onClick={() => {
                setIsShowForm(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isShowForm && (
            <TransactionForm
              onSuccess={async (input) => {
                setIsShowForm(false);
                if (editingId) {
                  setTransactions(
                    transactions.map((t) =>
                      t.id === editingId
                        ? {
                            ...t,
                            amount: input.amount,
                            type: input.type,
                            date: input.date,
                            description: input.description,
                            category_id: input.categoryId ?? null,
                            receiver_id: input.receiverId || t.receiver_id,
                          }
                        : t
                    )
                  );
                } else {
                  // Optimistic add with temp ID; router.refresh() will correct it
                  setTransactions([
                    {
                      id: `temp-${Date.now()}`,
                      amount: input.amount,
                      type: input.type,
                      date: input.date,
                      description: input.description,
                      category_id: null,
                      sender_id: '',
                      receiver_id: input.receiverId || '',
                    },
                    ...transactions,
                  ]);
                }
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
                      <TableCell>{transaction.description || '-'}</TableCell>
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
                          {transaction.type === 'income' ? '+' : '-'}$
                          {transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(transaction.id);
                              setIsShowForm(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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
