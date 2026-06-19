'use client';

import { type FC, useState, useEffect, type SubmitEvent, useTransition } from 'react';
import {
  getReceiversAction,
  createTransactionAction,
  updateTransactionAction,
} from '@/app/actions/transactions';
import { DatePicker, showError } from '@/components/ui';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/shadcn';
import type { ITransaction, ICategory } from '@/interfaces';

interface ITransactionForm {
  onSuccess: (input: {
    amount: number;
    type: 'income' | 'expense';
    description: string | null;
    date: string;
    receiverId?: string;
    categoryId?: string | null;
  }) => void;
  onCancel: () => void;
  editingId: string | null;
  editingTransaction?: ITransaction | null;
  categories: ICategory[];
}

export const TransactionForm: FC<ITransactionForm> = ({
  onSuccess,
  onCancel,
  editingId,
  editingTransaction,
  categories,
}) => {
  const [formData, setFormData] = useState({
    amount: editingTransaction ? String(editingTransaction.amount) : '',
    type: editingTransaction?.type ?? ('expense' as 'income' | 'expense'),
    description: editingTransaction?.description ?? '',
    date: editingTransaction?.date ?? new Date().toISOString().split('T')[0],
    receiverId: editingTransaction?.receiver_id ?? '',
    categoryId: editingTransaction?.category_id ?? '',
  });
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const result = await getReceiversAction();
      if (isCancelled) return;
      if (result.isSuccess) {
        setUsers(result.data);
      } else if (result.error) {
        showError('Transaction', result.error);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input: {
      amount: number;
      type: 'income' | 'expense';
      description: string | null;
      date: string;
      receiverId?: string;
      categoryId?: string | null;
    } = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description || null,
      date: formData.date,
    };
    if (formData.receiverId) {
      input.receiverId = formData.receiverId;
    }
    if (formData.categoryId) {
      input.categoryId = formData.categoryId;
    }

    startTransition(async () => {
      const result = editingId
        ? await updateTransactionAction({ id: editingId, input })
        : await createTransactionAction(input);

      if (result.isSuccess) {
        onSuccess(input);
      } else if (result.error) {
        showError('Transaction', result.error);
      }
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => {
                  setFormData({ ...formData, type: v as 'income' | 'expense' });
                }}
              >
                <SelectTrigger className="w-full" id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => {
                  setFormData({ ...formData, date });
                }}
              />
            </div>

            {users.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="receiver">Receiver</Label>
                <Select
                  value={formData.receiverId}
                  onValueChange={(v) => {
                    setFormData({ ...formData, receiverId: v });
                  }}
                >
                  <SelectTrigger className="w-full" id="receiver">
                    <SelectValue placeholder="Select receiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => {
                    setFormData({ ...formData, categoryId: v });
                  }}
                >
                  <SelectTrigger className="w-full" id="category">
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending || !formData.amount}>
              {isPending ? 'Saving...' : editingId ? 'Update' : 'Add'} Transaction
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
