'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { TransactionForm } from '@/components/layout';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  category_id: string | null;
  sender_id: string;
  receiver_id: string;
}

export function TransactionsTable({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) throw error;
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter((trans) => {
    const matchesSearch =
      trans.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trans.amount.toString().includes(searchTerm);
    const matchesFilter = filterType === 'all' || trans.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>View and manage all your transactions</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {showForm && (
            <TransactionForm
              userId={userId}
              onSuccess={() => {
                setShowForm(false);
                setEditingId(null);
                fetchTransactions();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              editingId={editingId}
            />
          )}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-64"
              />
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('income')}
                >
                  Income
                </Button>
                <Button
                  variant={filterType === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('expense')}
                >
                  Expenses
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
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
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span
                          className={
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                            onClick={() => setEditingId(transaction.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
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
}
