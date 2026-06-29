import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ECurrency, EExchangeRateProvider } from '@/enums';
import type { ICategory, ICurrency, ITransaction } from '@/interfaces';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockRouterRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}));

vi.mock('@/lib/with-timeout', () => ({
  withTimeout: <T,>(p: Promise<T>) => p,
}));

vi.mock('@/lib/exchange-rate', () => ({
  convertToUsd: (amount: number, rate: number) => Number((amount * rate).toFixed(2)),
  getDisplayRate: (_rate: number, _currency: ECurrency) => _rate,
  mapProvider: (value: string) => value,
}));

const mockGetExchangeRateAction = vi.fn();

vi.mock('@/app/actions/exchange-rate', () => ({
  getExchangeRateAction: (...args: unknown[]) => mockGetExchangeRateAction(...args),
}));

const mockCreateTransactionAction = vi.fn();
const mockUpdateTransactionAction = vi.fn();
const mockGetReceiversAction = vi.fn();

vi.mock('@/app/actions/transactions', () => ({
  createTransactionAction: (...args: unknown[]) => mockCreateTransactionAction(...args),
  updateTransactionAction: (...args: unknown[]) => mockUpdateTransactionAction(...args),
  getReceiversAction: () => mockGetReceiversAction(),
}));

const mockShowError = vi.fn();

vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<typeof import('@/components/ui')>('@/components/ui');
  const React = await import('react');

  return {
    ...actual,
    DatePicker: ({ onChange, value }: { onChange: (date: string) => void; value: string }) => (
      <input
        aria-label="Date"
        data-testid="date-picker"
        type="date"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    ),
    Select: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value?: string;
      onValueChange?: (value: string) => void;
    }) => {
      const options = React.Children.toArray(children).flatMap((child) => {
        if (!React.isValidElement(child)) return [];
        const element = child as React.ReactElement<{ value?: string; children?: React.ReactNode }>;
        if (element.props.value === undefined) {
          return React.Children.toArray(element.props.children).filter(
            (c): c is React.ReactElement<{ value: string; children: React.ReactNode }> => {
              if (!React.isValidElement(c)) return false;
              const option = c as React.ReactElement<{ value?: string }>;
              return option.props.value !== undefined;
            }
          );
        }
        return [element as React.ReactElement<{ value: string; children: React.ReactNode }>];
      });

      return (
        <select
          value={value}
          onChange={(e) => {
            onValueChange?.(e.target.value);
          }}
        >
          {options.map((option) => (
            <option key={option.props.value} value={option.props.value}>
              {option.props.children}
            </option>
          ))}
        </select>
      );
    },
    SelectContent: ({ children }: { children: React.ReactNode }) => children,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
      <button id={id} type="button">
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>,
    showError: mockShowError,
  };
});

vi.mock('@/lib/shadcn', async () => {
  const React = await import('react');

  return {
    Button: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
      ({ children, ...props }, ref) => (
        <button ref={ref} {...props}>
          {children}
        </button>
      )
    ),
    Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
      ({ ...props }, ref) => <input ref={ref} {...props} />
    ),
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    ToggleGroup: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value?: string;
      onValueChange?: (value: string) => void;
    }) => (
      <div role="radiogroup">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const item = child as React.ReactElement<{
            value: string;
            onClick?: () => void;
            'data-active'?: boolean;
          }>;
          return React.cloneElement(item, {
            'data-active': item.props.value === value,
            onClick: () => onValueChange?.(item.props.value),
          });
        })}
      </div>
    ),
    ToggleGroupItem: ({
      children,
      value,
      onClick,
      'data-active': dataActive,
    }: {
      children: React.ReactNode;
      value: string;
      onClick?: () => void;
      'data-active'?: boolean;
    }) => (
      <button type="button" role="radio" aria-checked={dataActive} value={value} onClick={onClick}>
        {children}
      </button>
    ),
  };
});

/* ── Helpers ───────────────────────────────────────────────────── */

const currencies: ICurrency[] = [
  { id: 'currency-usd', code: ECurrency.USD, name: 'US dollar', symbol: '$', created_at: '' },
  {
    id: 'currency-uah',
    code: ECurrency.UAH,
    name: 'Ukrainian hryvnia',
    symbol: '₴',
    created_at: '',
  },
  { id: 'currency-eur', code: ECurrency.EUR, name: 'Euro', symbol: '€', created_at: '' },
];

const categories: ICategory[] = [
  { id: 'category-1', name: 'Groceries', type: 'expense', color: '#000000', type_id: undefined },
];

function setup(props: Partial<Parameters<typeof TransactionForm>[0]> = {}) {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  render(
    <TransactionForm
      onSuccess={onSuccess}
      onCancel={onCancel}
      editingId={null}
      categories={categories}
      currencies={currencies}
      {...props}
    />
  );

  return { onSuccess, onCancel };
}

/* ── Dynamic import after mocks are configured ──────────────────── */

let TransactionForm: typeof import('@/components/layouts/TransactionForm').TransactionForm;

beforeEach(async () => {
  vi.clearAllMocks();
  mockGetReceiversAction.mockResolvedValue({ isSuccess: true, data: [] });
  mockGetExchangeRateAction.mockResolvedValue({ isSuccess: true, data: 41.5 });
  mockCreateTransactionAction.mockResolvedValue({ isSuccess: true, data: undefined });
  mockUpdateTransactionAction.mockResolvedValue({ isSuccess: true, data: undefined });

  const module = await import('@/components/layouts/TransactionForm');
  TransactionForm = module.TransactionForm;
});

/* ── Tests ─────────────────────────────────────────────────────── */

describe('TransactionForm layout and behavior', () => {
  it('renders three semantic sections with bordered containers', async () => {
    setup();

    expect(screen.getByRole('group', { name: 'Amount' })).toBeDefined();
    expect(screen.getByRole('group', { name: 'Details' })).toBeDefined();
    expect(screen.getByRole('group', { name: 'Date & note' })).toBeDefined();
  });

  it('renders type as a toggle group with Expense and Income', async () => {
    setup();

    expect(screen.getByRole('radio', { name: 'Expense' })).toBeDefined();
    expect(screen.getByRole('radio', { name: 'Income' })).toBeDefined();
  });

  it('auto-fills the exchange rate when a non-USD currency is selected', async () => {
    setup();

    const currencySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(currencySelect, { target: { value: currencies[1].id } });

    await waitFor(() => {
      expect(mockGetExchangeRateAction).toHaveBeenCalledWith(
        ECurrency.UAH,
        EExchangeRateProvider.PrivatBank
      );
    });
  });

  it('preserves a manually edited exchange rate and submits it', async () => {
    setup();

    const amountInput = screen.getByLabelText('Amount*');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const currencySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(currencySelect, { target: { value: currencies[1].id } });

    await waitFor(() => {
      expect(mockGetExchangeRateAction).toHaveBeenCalled();
    });

    const rateInput = screen.getByLabelText('Exchange rate to USD');
    fireEvent.change(rateInput, { target: { value: '40' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(mockCreateTransactionAction).toHaveBeenCalled();
    });

    const payload = mockCreateTransactionAction.mock.calls[0][0];
    expect(payload.exchangeRate).toBeCloseTo(1 / 40, 6);
    expect(payload.amountUsd).toBe(2.5);
  });

  it('submits create payload with the expected shape', async () => {
    const { onSuccess } = setup();

    const amountInput = screen.getByLabelText('Amount*');
    fireEvent.change(amountInput, { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(mockCreateTransactionAction).toHaveBeenCalled();
    });

    const payload = mockCreateTransactionAction.mock.calls[0][0];
    expect(payload).toMatchObject({
      amount: 50,
      currencyId: currencies[0].id,
      exchangeRate: 1,
      amountUsd: 50,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      description: null,
      date: expect.any(String),
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('updates the submitted type when the Income toggle is selected', async () => {
    setup();

    fireEvent.click(screen.getByRole('radio', { name: 'Income' }));

    const amountInput = screen.getByLabelText('Amount*');
    fireEvent.change(amountInput, { target: { value: '75' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(mockCreateTransactionAction).toHaveBeenCalled();
    });

    const payload = mockCreateTransactionAction.mock.calls[0][0];
    expect(payload.type).toBe('income');
  });

  it('calls update action with the editing transaction id', async () => {
    const editingTransaction: ITransaction = {
      id: 'transaction-1',
      amount: 100,
      currency_id: currencies[1].id,
      exchange_rate: 1 / 41.5,
      rate_provider: EExchangeRateProvider.PrivatBank,
      amount_usd: 2.41,
      type: 'expense',
      date: '2026-06-20',
      description: 'Existing',
      category_id: null,
      sender_id: 'user-1',
      receiver_id: 'user-1',
    };

    setup({
      editingId: 'transaction-1',
      editingTransaction,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update Transaction' }));

    await waitFor(() => {
      expect(mockUpdateTransactionAction).toHaveBeenCalledWith({
        id: 'transaction-1',
        input: expect.any(Object),
      });
    });
  });
});
