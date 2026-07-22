import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

let mockDashboardResult:
  | { isSuccess: false; error: string }
  | {
      isSuccess: true;
      data: {
        transactions: { id: string; amount_usd: number; date: string; type: string }[];
        stats: { total_balance: number; total_income: number; total_expense: number } | null;
        statsError?: string;
      };
    } = {
  isSuccess: true,
  data: {
    transactions: [{ id: 't-1', amount_usd: 100, date: '2026-07-22', type: 'income' }],
    stats: { total_balance: 100, total_income: 100, total_expense: 0 },
  },
};

vi.mock('@/app/actions/dashboard', () => ({
  getDashboardDataAction: () => Promise.resolve(mockDashboardResult),
}));

vi.mock('@/components/layouts', () => ({
  DashboardOverview: ({ transactions }: { transactions: unknown[] }) => (
    <div data-testid="dashboard-overview">Transactions: {transactions.length}</div>
  ),
}));

const { DashboardPage } = await import('@/components/pages/dashboard');

async function renderDashboardPage() {
  const ui = await DashboardPage();
  return render(ui);
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardResult = {
      isSuccess: true,
      data: {
        transactions: [{ id: 't-1', amount_usd: 100, date: '2026-07-22', type: 'income' }],
        stats: { total_balance: 100, total_income: 100, total_expense: 0 },
      },
    };
  });

  it('renders ErrorState when getDashboardDataAction fails', async () => {
    mockDashboardResult = { isSuccess: false, error: 'Database connection failed' };

    await renderDashboardPage();

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Failed to load dashboard')).toBeDefined();
    expect(screen.getByText('Database connection failed')).toBeDefined();
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined();
  });

  it('renders DashboardOverview when getDashboardDataAction succeeds', async () => {
    await renderDashboardPage();

    expect(screen.getByTestId('dashboard-overview')).toBeDefined();
    expect(screen.getByText('Transactions: 1')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
