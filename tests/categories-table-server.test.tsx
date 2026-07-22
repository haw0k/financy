import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

let mockCategoriesResult:
  | { isSuccess: false; error: string }
  | {
      isSuccess: true;
      data: {
        categories: { id: string }[];
        categoryTypes: { id: string }[];
      };
    } = {
  isSuccess: true,
  data: { categories: [], categoryTypes: [] },
};

vi.mock('@/app/actions/categories', () => ({
  getCategoriesDataAction: () => Promise.resolve(mockCategoriesResult),
}));

vi.mock('@/components/layouts/CategoriesTableClient', () => ({
  CategoriesTableClient: () => <div data-testid="categories-table-client">Client Table</div>,
}));

const { CategoriesTableServer } = await import('@/components/layouts/CategoriesTableServer');

async function renderCategoriesTableServer() {
  const ui = await CategoriesTableServer();
  return render(ui);
}

describe('CategoriesTableServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoriesResult = { isSuccess: true, data: { categories: [], categoryTypes: [] } };
  });

  it('renders ErrorState when getCategoriesDataAction fails', async () => {
    mockCategoriesResult = { isSuccess: false, error: 'Cannot load categories' };

    await renderCategoriesTableServer();

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Failed to load categories')).toBeDefined();
    expect(screen.getByText('Cannot load categories')).toBeDefined();
    expect(screen.queryByTestId('categories-table-client')).toBeNull();
  });

  it('renders CategoriesTableClient when action succeeds', async () => {
    await renderCategoriesTableServer();

    expect(screen.getByTestId('categories-table-client')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
