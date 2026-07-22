import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

let mockTransactionsResult:
  | { isSuccess: false; error: string }
  | {
      isSuccess: true;
      data: {
        transactions: { id: string }[];
        categories: { id: string }[];
        categoryTypes: { id: string }[];
      };
    } = {
  isSuccess: true,
  data: { transactions: [], categories: [], categoryTypes: [] },
};

let mockCurrenciesResult:
  | { isSuccess: false; error: string }
  | { isSuccess: true; data: { id: string; code: string }[] } = {
  isSuccess: true,
  data: [],
};

vi.mock('@/app/actions/transactions', () => ({
  getTransactionsDataAction: () => Promise.resolve(mockTransactionsResult),
}));

vi.mock('@/app/actions/currencies', () => ({
  getCurrenciesAction: () => Promise.resolve(mockCurrenciesResult),
}));

vi.mock('@/components/layouts/TransactionsTableClient', () => ({
  TransactionsTableClient: () => <div data-testid="transactions-table-client">Client Table</div>,
}));

const { TransactionsTableServer } = await import('@/components/layouts/TransactionsTableServer');

async function renderTransactionsTableServer() {
  const ui = await TransactionsTableServer();
  return render(ui);
}

describe('TransactionsTableServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionsResult = {
      isSuccess: true,
      data: { transactions: [], categories: [], categoryTypes: [] },
    };
    mockCurrenciesResult = { isSuccess: true, data: [] };
  });

  it('renders ErrorState when getTransactionsDataAction fails', async () => {
    mockTransactionsResult = { isSuccess: false, error: 'Cannot load transactions' };

    await renderTransactionsTableServer();

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Failed to load transactions')).toBeDefined();
    expect(screen.getByText('Cannot load transactions')).toBeDefined();
    expect(screen.queryByTestId('transactions-table-client')).toBeNull();
  });

  it('renders ErrorState when getCurrenciesAction fails', async () => {
    mockCurrenciesResult = { isSuccess: false, error: 'Cannot load currencies' };

    await renderTransactionsTableServer();

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Failed to load currencies')).toBeDefined();
    expect(screen.getByText('Cannot load currencies')).toBeDefined();
    expect(screen.queryByTestId('transactions-table-client')).toBeNull();
  });

  it('renders TransactionsTableClient when both actions succeed', async () => {
    await renderTransactionsTableServer();

    expect(screen.getByTestId('transactions-table-client')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
