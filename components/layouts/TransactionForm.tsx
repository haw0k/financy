'use client';

import { type FC, useState, useEffect, type SubmitEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
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

interface ITransactionForm {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editingId: string | null;
}

export const TransactionForm: FC<ITransactionForm> = ({
  userId,
  onSuccess,
  onCancel,
  editingId,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiverId: '',
  });
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Fetch other users
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .neq('id', userId);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [userId, supabase]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const transactionData = {
        sender_id: userId,
        receiver_id: formData.receiverId || userId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || null,
        date: formData.date,
      };

      if (editingId) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([transactionData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsLoading(false);
    }
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
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                }}
                required
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
            <Button type="submit" disabled={isLoading || !formData.amount}>
              {isLoading ? 'Saving...' : editingId ? 'Update' : 'Add'} Transaction
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
