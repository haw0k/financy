'use client';

import { type FC, type SubmitEvent, useEffect, useState, useTransition } from 'react';
import { Button, Input, Label, ToggleGroup, ToggleGroupItem } from '@/lib/shadcn';
import {
  DatePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  showError,
} from '@/components/ui';
import { convertToUsd, getDisplayRate, mapProvider } from '@/lib/exchange-rate';
import { getCategoryIcon } from '@/lib/icons';
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
import type { TExchangeRateProvider } from '@/types';

interface ITransactionForm {
  onSuccess: (input: {
    amount: number;
    currencyId: string;
    exchangeRate: number;
    amountUsd: number;
    rateProvider: EExchangeRateProvider;
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

function getDefaultCurrencyId(currencies: ICurrency[]): string {
  return currencies.find((c) => c.code === ECurrency.USD)?.id ?? currencies[0]?.id ?? '';
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
    currencyId: editingTransaction?.currency_id ?? getDefaultCurrencyId(currencies),
    // The display rate is always shown with 4 decimals and is the inverse for UAH.
    displayRate: editingTransaction
      ? String(
          getDisplayRate(
            editingTransaction.exchange_rate,
            getCurrencyCodeById(currencies, editingTransaction.currency_id) as ECurrency
          )
        )
      : '1',
    rateProvider: (editingTransaction?.rate_provider ?? DEFAULT_PROVIDER) as TExchangeRateProvider,
    type: editingTransaction?.type ?? ('expense' as 'income' | 'expense'),
    description: editingTransaction?.description ?? '',
    date: editingTransaction?.date ?? new Date().toISOString().split('T')[0],
    receiverId: editingTransaction?.receiver_id ?? '',
    categoryId: editingTransaction?.category_id ?? '',
  });
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isUserEditedRate, setIsUserEditedRate] = useState(false);

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
      setFormData((prev) => ({ ...prev, displayRate: '1' }));
      setIsUserEditedRate(false);
      return;
    }

    if (isUserEditedRate) {
      return;
    }

    let isCancelled = false;
    setIsLoadingRate(true);

    (async () => {
      const result = await getExchangeRateAction(currencyCode as ECurrency, formData.rateProvider);
      if (isCancelled) return;
      if (result.isSuccess) {
        const displayRate = getDisplayRate(result.data ?? 1, currencyCode as ECurrency);
        setFormData((prev) => ({ ...prev, displayRate: String(displayRate) }));
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
    const currencyCode = getCurrencyCodeById(currencies, formData.currencyId);
    const isUah = currencyCode === ECurrency.UAH;
    const displayRate = Number(Number.parseFloat(formData.displayRate).toFixed(4));

    if (currencyCode !== ECurrency.USD && (Number.isNaN(displayRate) || displayRate <= 0)) {
      showError('Transaction', TRANSACTION_MSGS.INVALID_RATE);
      return;
    }

    const exchangeRate = Number((isUah ? 1 / displayRate : displayRate).toFixed(4));
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
  const currencySymbol = currencies.find((c) => c.id === formData.currencyId)?.symbol ?? '';
  const usdSymbol = currencies.find((c) => c.code === ECurrency.USD)?.symbol ?? '$';
  const isUsd = currencyCode === ECurrency.USD;
  const isUah = currencyCode === ECurrency.UAH;
  const rateLabel = isUah ? `${currencySymbol}/${usdSymbol}` : `${usdSymbol}/${currencySymbol}`;
  const computedAmountUsd = (() => {
    const amount = Number.parseFloat(formData.amount) || 0;
    const displayRate = Number.parseFloat(formData.displayRate) || 0;
    if (isUsd) {
      return amount.toFixed(2);
    }
    if (!amount || !displayRate) {
      return '';
    }
    const exchangeRate = isUah ? 1 / displayRate : displayRate;
    return convertToUsd(amount, exchangeRate).toFixed(2);
  })();

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border bg-card p-6">
      <fieldset className="min-w-0 space-y-4 rounded-lg border px-4 pb-4">
        <legend className="px-2 text-sm font-medium text-foreground">Amount</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="amount" className="gap-0.5 text-xs text-muted-foreground">
              Amount
              <span className="text-destructive">*</span>
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
            <Label htmlFor="currency" className="gap-0.5 text-xs text-muted-foreground">
              Currency
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.currencyId}
              onValueChange={(v) => {
                setFormData({ ...formData, currencyId: v });
                setIsUserEditedRate(false);
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
              <div className="flex items-center justify-end gap-4 pt-1">
                <Label htmlFor="rateProvider" className="sr-only">
                  Rate provider
                </Label>
                <Select
                  value={formData.rateProvider}
                  onValueChange={(v) => {
                    setFormData({ ...formData, rateProvider: v as TExchangeRateProvider });
                    setIsUserEditedRate(false);
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-fit gap-1 border-none bg-secondary px-2 text-xs hover:bg-secondary/80"
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
                <Label htmlFor="inverseRate" className="sr-only">
                  Exchange rate to USD
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-muted-foreground">
                    {rateLabel}
                  </span>
                  <Input
                    id="inverseRate"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    placeholder="1.0"
                    value={formData.displayRate}
                    disabled={isLoadingRate}
                    onChange={(e) => {
                      setFormData({ ...formData, displayRate: e.target.value });
                      setIsUserEditedRate(true);
                    }}
                    required
                    className="h-8 w-32 pl-12 pr-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0 space-y-4 rounded-lg border px-4 pb-4">
        <legend className="px-2 text-sm font-medium text-foreground">Details</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="gap-0.5 text-xs text-muted-foreground">
              Type
              <span className="text-destructive">*</span>
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              className="w-full"
              value={formData.type}
              onValueChange={(v) => {
                if (v) {
                  setFormData({ ...formData, type: v as 'income' | 'expense' });
                }
              }}
            >
              <ToggleGroupItem value="expense" className="flex-1">
                Expense
              </ToggleGroupItem>
              <ToggleGroupItem value="income" className="flex-1">
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
                  {categories.map((cat) => {
                    const CategoryIcon = getCategoryIcon(cat.icon);

                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <CategoryIcon className="h-4 w-4" />
                        {cat.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2 md:col-span-2">
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
      </fieldset>

      <fieldset className="min-w-0 space-y-4 rounded-lg border px-4 pb-4">
        <legend className="px-2 text-sm font-medium text-foreground">Date & note</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date" className="gap-0.5 text-xs text-muted-foreground">
              Date
              <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              value={formData.date}
              onChange={(date) => {
                setFormData({ ...formData, date });
              }}
            />
          </div>

          <div className="space-y-2">
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
      </fieldset>

      <div className="flex justify-end gap-4 pt-2">
        <Button type="submit" disabled={isPending || !formData.amount}>
          {isPending ? 'Saving...' : editingId ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
