'use client';

import { type FC, type SubmitEvent, useEffect, useState, useTransition } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from '@/lib/shadcn';
import { DatePicker, showError } from '@/components/ui';
import { convertToUsd, mapProvider } from '@/lib/exchange-rate';
import { withTimeout } from '@/lib/with-timeout';
import { ECurrency, EExchangeRateProvider } from '@/enums';
import { getExchangeRateAction } from '@/app/actions/exchange-rate';
import {
  createTransactionAction,
  getReceiversAction,
  updateTransactionAction,
} from '@/app/actions/transactions';
import { TRANSACTION_MSGS } from '@/messages';
import type { ICategory, ICurrency, ITransaction } from '@/interfaces';

interface ITransactionForm {
  onSuccess: (input: {
    amount: number;
    currencyId: string;
    exchangeRate: number;
    amountUsd: number;
    rateProvider?: string;
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
  currencies: ICurrency[];
}

const DEFAULT_PROVIDER = EExchangeRateProvider.PrivatBank;

function getCurrencyCodeById(currencies: ICurrency[], id: string): string | null {
  return currencies.find((c) => c.id === id)?.code ?? null;
}

export const TransactionForm: FC<ITransactionForm> = ({
  onSuccess,
  onCancel,
  editingId,
  editingTransaction,
  categories,
  currencies,
}) => {
  const [formData, setFormData] = useState({
    amount: editingTransaction ? String(editingTransaction.amount) : '',
    currencyId: editingTransaction?.currency_id ?? currencies[0]?.id ?? '',
    exchangeRate: editingTransaction ? String(editingTransaction.exchange_rate) : '1',
    rateProvider: DEFAULT_PROVIDER as string,
    type: editingTransaction?.type ?? ('expense' as 'income' | 'expense'),
    description: editingTransaction?.description ?? '',
    date: editingTransaction?.date ?? new Date().toISOString().split('T')[0],
    receiverId: editingTransaction?.receiver_id ?? '',
    categoryId: editingTransaction?.category_id ?? '',
  });
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingRate, setIsLoadingRate] = useState(false);

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

  useEffect(() => {
    const currencyCode = getCurrencyCodeById(currencies, formData.currencyId);
    if (!currencyCode || currencyCode === ECurrency.USD) {
      setFormData((prev) => ({ ...prev, exchangeRate: '1' }));
      return;
    }

    let isCancelled = false;
    setIsLoadingRate(true);

    (async () => {
      const result = await getExchangeRateAction(currencyCode as ECurrency, formData.rateProvider);
      if (isCancelled) return;
      if (result.isSuccess) {
        setFormData((prev) => ({ ...prev, exchangeRate: String(result.data?.toFixed(4)) }));
      } else if (result.error) {
        showError('Exchange rate', result.error);
      }
      setIsLoadingRate(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [formData.currencyId, formData.rateProvider, currencies]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = Number(Number.parseFloat(formData.amount).toFixed(2));
    const exchangeRate = Number(Number.parseFloat(formData.exchangeRate).toFixed(4));
    const currencyCode = getCurrencyCodeById(currencies, formData.currencyId);
    const amountUsd = currencyCode === ECurrency.USD ? amount : convertToUsd(amount, exchangeRate);

    const input = {
      amount,
      currencyId: formData.currencyId,
      exchangeRate,
      amountUsd,
      rateProvider: mapProvider(formData.rateProvider),
      type: formData.type,
      description: formData.description || null,
      date: formData.date,
      ...(formData.receiverId && { receiverId: formData.receiverId }),
      ...(formData.categoryId && { categoryId: formData.categoryId }),
    };

    startTransition(async () => {
      try {
        const result = await withTimeout(
          editingId
            ? updateTransactionAction({ id: editingId, input })
            : createTransactionAction(input)
        );

        if (result.isSuccess) {
          onSuccess(input);
        } else if (result.error) {
          showError('Transaction', result.error);
        }
      } catch {
        showError('Transaction', TRANSACTION_MSGS.TIMEOUT);
      }
    });
  };

  const currencyCode = getCurrencyCodeById(currencies, formData.currencyId);
  const isUsd = currencyCode === ECurrency.USD;
  const computedAmountUsd = (() => {
    const amount = Number.parseFloat(formData.amount) || 0;
    const exchangeRate = Number.parseFloat(formData.exchangeRate) || 0;
    if (isUsd) {
      return amount.toFixed(2);
    }
    if (!amount || !exchangeRate) {
      return '';
    }
    return convertToUsd(amount, exchangeRate).toFixed(2);
  })();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {editingId ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Amount</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs text-muted-foreground">
                  Amount
                </Label>
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
                <Label htmlFor="currency" className="text-xs text-muted-foreground">
                  Currency
                </Label>
                <Select
                  value={formData.currencyId}
                  onValueChange={(v) => {
                    setFormData({ ...formData, currencyId: v });
                  }}
                >
                  <SelectTrigger className="w-full" id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountUsd" className="text-xs text-muted-foreground">
                  Amount in USD
                </Label>
                <Input
                  id="amountUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={computedAmountUsd}
                  disabled
                />
                {!isUsd && currencyCode && (
                  <div className="flex items-center gap-2 pt-1">
                    <Label htmlFor="rateProvider" className="sr-only">
                      Rate provider
                    </Label>
                    <Select
                      value={formData.rateProvider}
                      onValueChange={(v) => {
                        setFormData({ ...formData, rateProvider: v });
                      }}
                    >
                      <SelectTrigger
                        className="h-6 w-fit gap-1 border-none bg-secondary px-2 text-xs hover:bg-secondary/80"
                        id="rateProvider"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EExchangeRateProvider.PrivatBank}>PrivatBank</SelectItem>
                        <SelectItem value={EExchangeRateProvider.Monobank}>Monobank</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">·</span>
                    <Label htmlFor="exchangeRate" className="sr-only">
                      Exchange rate to USD
                    </Label>
                    <Input
                      id="exchangeRate"
                      type="number"
                      step="0.000001"
                      min="0"
                      placeholder="1.0"
                      value={formData.exchangeRate}
                      disabled={isLoadingRate}
                      onChange={(e) => {
                        setFormData({ ...formData, exchangeRate: e.target.value });
                      }}
                      required
                      className="h-6 w-24 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">{currencyCode}/USD</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="w-full sm:w-fit"
                  value={formData.type}
                  onValueChange={(v) => {
                    if (v) {
                      setFormData({ ...formData, type: v as 'income' | 'expense' });
                    }
                  }}
                >
                  <ToggleGroupItem value="expense" className="flex-1 sm:flex-initial">
                    Expense
                  </ToggleGroupItem>
                  <ToggleGroupItem value="income" className="flex-1 sm:flex-initial">
                    Income
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs text-muted-foreground">
                    Category
                  </Label>
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

              {users.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="receiver" className="text-xs text-muted-foreground">
                    Receiver
                  </Label>
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
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Date & note</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs text-muted-foreground">
                  Date
                </Label>
                <DatePicker
                  value={formData.date}
                  onChange={(date) => {
                    setFormData({ ...formData, date });
                  }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-xs text-muted-foreground">
                  Description
                </Label>
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
