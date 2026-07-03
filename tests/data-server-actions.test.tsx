import { revalidatePath, revalidateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TAGS, mutationRevalidateProfile } from '@/config';
import { EExchangeRateProvider } from '@/enums';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockUser = { id: 'user-1' };
const mockGetUser = vi.fn(() =>
  Promise.resolve<{ data: { user: { id: string } | null }; error: null }>({
    data: { user: mockUser },
    error: null,
  })
);
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    }),
}));

vi.mock('@/lib/with-timeout', () => ({
  withTimeout: <T,>(p: Promise<T>) => p,
}));

function mockApprovedProfile(role = 'sender') {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return createQueryBuilder({ status: 'approved', role });
    }
    return createQueryBuilder(null);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockReturnValue(Promise.resolve({ data: { user: mockUser }, error: null }));
  mockApprovedProfile();
});

/* ── Helpers ───────────────────────────────────────────────────── */

function createQueryBuilder<T>(data: T, error: unknown = null) {
  const builder: Record<string, unknown> = {};
  const thenable = Promise.resolve({ data, error });
  const method = () => builder;

  Object.assign(builder, {
    select: method,
    eq: method,
    neq: (_col: string, value: unknown) => {
      const dataArray = Array.isArray(data) ? data : null;
      if (dataArray && _col === 'id') {
        const filtered = dataArray.filter((item: Record<string, unknown>) => item[_col] !== value);
        return createQueryBuilder(filtered as T, error);
      }
      return builder;
    },
    order: method,
    limit: method,
    maybeSingle: method,
    single: () =>
      Promise.resolve({
        data: Array.isArray(data) ? (data[0] ?? null) : data,
        error,
      }),
    insert: method,
    update: method,
    delete: method,
    then: thenable.then.bind(thenable),
    catch: thenable.catch.bind(thenable),
    finally: thenable.finally.bind(thenable),
  });

  return builder;
}

/* ── Dashboard ─────────────────────────────────────────────────── */

describe('getDashboardDataAction', () => {
  it('should return transactions and stats on success', async () => {
    const { getDashboardDataAction } = await import('@/app/actions/dashboard');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.transactions) {
        return createQueryBuilder([{ id: 't1', amount: 100 }]);
      }
      return createQueryBuilder(null);
    });
    mockRpc.mockResolvedValue({
      data: { total_balance: 100, total_income: 200, total_expense: 100 },
      error: null,
    });

    const result = await getDashboardDataAction();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data.transactions).toHaveLength(1);
      expect(result.data.stats).toEqual({
        total_balance: 100,
        total_income: 200,
        total_expense: 100,
      });
      expect(result.data.statsError).toBeUndefined();
    }
  });

  it('should return statsError when stats RPC fails', async () => {
    const { getDashboardDataAction } = await import('@/app/actions/dashboard');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.transactions) {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });
    mockRpc.mockResolvedValue({ data: null, error: { code: 'XX000', message: 'Stats error' } });

    const result = await getDashboardDataAction();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data.stats).toBeNull();
      expect(result.data.statsError).toBe('Stats error');
    }
  });

  it('should return error when not authenticated', async () => {
    const { getDashboardDataAction } = await import('@/app/actions/dashboard');

    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await getDashboardDataAction();

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
  });

  it('should reject pending users', async () => {
    const { getDashboardDataAction } = await import('@/app/actions/dashboard');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'pending', role: 'sender' });
      }
      return createQueryBuilder(null);
    });

    const result = await getDashboardDataAction();

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toContain('pending');
    }
  });

  it('should reject admin users', async () => {
    const { getDashboardDataAction } = await import('@/app/actions/dashboard');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved', role: 'admin' });
      }
      return createQueryBuilder(null);
    });

    const result = await getDashboardDataAction();

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Admin accounts cannot access financial data.');
    }
  });
});

/* ── Receivers ───────────────────────────────────────────────────── */

describe('getReceiversAction', () => {
  it('should return approved non-admin receivers excluding self', async () => {
    const { getReceiversAction } = await import('@/app/actions/transactions');

    mockFrom.mockReturnValueOnce(createQueryBuilder({ status: 'approved' })).mockReturnValueOnce(
      createQueryBuilder([
        { id: 'user-2', email: 'a@test.com' },
        { id: 'user-3', email: 'b@test.com' },
      ])
    );

    const result = await getReceiversAction();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data).toHaveLength(2);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    }
  });

  it('should return error when query fails', async () => {
    const { getReceiversAction } = await import('@/app/actions/transactions');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved' }))
      .mockReturnValueOnce(createQueryBuilder(null, { code: 'XX000', message: 'DB error' }));

    const result = await getReceiversAction();

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('DB error');
    }
  });

  it('should exclude the authenticated user id from receivers', async () => {
    const { getReceiversAction } = await import('@/app/actions/transactions');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null });
    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'sender' }))
      .mockReturnValueOnce(
        createQueryBuilder([
          { id: 'user-1', email: 'a@test.com' },
          { id: 'user-2', email: 'self@test.com' },
          { id: 'user-3', email: 'b@test.com' },
        ])
      );

    const result = await getReceiversAction();

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data).toHaveLength(2);
      expect(result.data.some((r) => r.id === 'user-2')).toBe(false);
    }
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });
});

/* ── Categories ──────────────────────────────────────────────────── */

describe('createCategoryAction', () => {
  it('should return validation error for empty name', async () => {
    const { createCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockClear();

    const result = await createCategoryAction({ name: '', type: 'expense', color: '#fff' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should return error when category type does not exist', async () => {
    const { createCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    const result = await createCategoryAction({
      name: 'Food',
      type: 'expense',
      color: '#fff',
      type_id: 'missing-id',
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Selected category type does not exist');
    }
  });

  it('should insert category on success', async () => {
    const { createCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder({ id: 'ct1' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([
          {
            id: 'cat1',
            name: 'Food',
            type: 'expense',
            color: '#fff',
            icon: 'circle',
            type_id: 'ct1',
          },
        ]);
      }
      return createQueryBuilder(null);
    });

    const result = await createCategoryAction({
      name: 'Food',
      type: 'expense',
      color: '#fff',
      type_id: 'ct1',
    });

    expect(result.isSuccess).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith(CACHE_TAGS.categories);
  });
});

describe('updateCategoryAction', () => {
  it('should return validation error for invalid type', async () => {
    const { updateCategoryAction } = await import('@/app/actions/categories');

    mockApprovedProfile();

    const result = await updateCategoryAction({
      id: 'cat1',
      input: { name: 'Food', type: 'invalid' as 'expense', color: '#fff' },
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return error when category is not found', async () => {
    const { updateCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder({ id: 'ct1' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await updateCategoryAction({
      id: 'missing',
      input: { name: 'Food', type: 'expense', color: '#fff', type_id: 'ct1' },
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Category not found');
    }
  });
});

describe('deleteCategoryAction', () => {
  it('should delete category on success', async () => {
    const { deleteCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([{ id: 'cat1' }]);
      }
      return createQueryBuilder(null);
    });

    const result = await deleteCategoryAction({ id: 'cat1' });

    expect(result.isSuccess).toBe(true);
  });

  it('should return error when category is not found', async () => {
    const { deleteCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await deleteCategoryAction({ id: 'missing' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Category not found');
    }
  });
});

/* ── Category Types ────────────────────────────────────────────── */

describe('createCategoryTypeAction', () => {
  it('should return validation error for empty name', async () => {
    const { createCategoryTypeAction } = await import('@/app/actions/categories');

    const result = await createCategoryTypeAction({ name: '' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
  });

  it('should insert category type on success', async () => {
    const { createCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([{ id: 'ct1', name: 'Goods', icon: 'circle' }]);
      }
      return createQueryBuilder(null);
    });

    const result = await createCategoryTypeAction({ name: 'Goods' });

    expect(result.isSuccess).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('category_types');
  });
});

describe('updateCategoryTypeAction', () => {
  it('should return error when category type is not found', async () => {
    const { updateCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await updateCategoryTypeAction({ id: 'missing', input: { name: 'Goods' } });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Category type not found');
    }
  });
});

describe('deleteCategoryTypeAction', () => {
  it('should return error when category type is not found', async () => {
    const { deleteCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await deleteCategoryTypeAction({ id: 'missing' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Category type not found');
    }
  });
});

/* ── Transactions ──────────────────────────────────────────────── */

describe('createTransactionAction', () => {
  it('should return validation error for non-positive amount', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockApprovedProfile();

    const result = await createTransactionAction({
      amount: 0,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1,
      amountUsd: 0,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return error for invalid receiver', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      callCount += 1;
      if (table === 'profiles') {
        if (callCount <= 2) {
          return createQueryBuilder({ id: 'user-1', status: 'approved', role: 'sender' });
        }
        return createQueryBuilder([]);
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'USD' });
      }
      if (table === 'transactions') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    const result = await createTransactionAction({
      amount: 100,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1,
      amountUsd: 100,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
      receiverId: 'missing-receiver',
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid receiver selected');
    }
  });

  it('should insert transaction on success with default receiver', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'USD' });
      }
      if (table === 'transactions') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    const result = await createTransactionAction({
      amount: 100,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1,
      amountUsd: 100,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(result.isSuccess).toBe(true);
  });

  it('should return error for invalid currency', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    const result = await createTransactionAction({
      amount: 100,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1,
      amountUsd: 100,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid currency selected');
    }
  });

  it('should return error when USD amount does not match exchange rate', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'UAH' });
      }
      return createQueryBuilder(null);
    });

    const result = await createTransactionAction({
      amount: 1000,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1 / 40,
      amountUsd: 999,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('USD amount does not match the provided exchange rate');
    }
  });

  it('should insert UAH transaction with correct USD amount', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'UAH' });
      }
      if (table === 'transactions') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    const result = await createTransactionAction({
      amount: 1000,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1 / 40,
      amountUsd: 25,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(result.isSuccess).toBe(true);
  });
});

describe('updateTransactionAction', () => {
  it('should return error when transaction is not found', async () => {
    const { updateTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ id: 'receiver-1', status: 'approved', role: 'sender' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'USD' });
      }
      if (table === 'transactions') {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await updateTransactionAction({
      id: 'missing',
      input: {
        amount: 100,
        currencyId: 'invalid-currency',
        exchangeRate: 1,
        amountUsd: 100,
        rateProvider: EExchangeRateProvider.PrivatBank,
        type: 'expense',
        date: '2026-06-20',
        description: null,
        receiverId: 'receiver-1',
      },
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Currency is required');
    }
  });

  it('should return error when USD amount does not match exchange rate', async () => {
    const { updateTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'EUR' });
      }
      if (table === 'transactions') {
        return createQueryBuilder([{ id: 't1' }]);
      }
      return createQueryBuilder(null);
    });

    const result = await updateTransactionAction({
      id: 't1',
      input: {
        amount: 100,
        currencyId: '123e4567-e89b-12d3-a456-426614174000',
        exchangeRate: 44.2 / 41.5,
        amountUsd: 50,
        rateProvider: EExchangeRateProvider.PrivatBank,
        type: 'expense',
        date: '2026-06-20',
        description: null,
      },
    });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('USD amount does not match the provided exchange rate');
    }
  });
});

describe('deleteTransactionAction', () => {
  it('should return error when transaction is not found', async () => {
    const { deleteTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.transactions) {
        return createQueryBuilder([]);
      }
      return createQueryBuilder(null);
    });

    const result = await deleteTransactionAction({ id: 'missing' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Transaction not found');
    }
  });
});

/* ── Cache revalidation ─────────────────────────────────────────── */

describe('cache revalidation', () => {
  it('createCategoryAction revalidates categories', async () => {
    const { createCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder({ id: 'ct1' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([
          {
            id: 'cat1',
            name: 'Food',
            type: 'expense',
            color: '#fff',
            icon: 'circle',
            type_id: 'ct1',
          },
        ]);
      }
      return createQueryBuilder(null);
    });

    await createCategoryAction({ name: 'Food', type: 'expense', color: '#fff', type_id: 'ct1' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categories,
      mutationRevalidateProfile
    );
  });

  it('updateCategoryAction revalidates categories', async () => {
    const { updateCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder({ id: 'ct1' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([{ id: 'cat1' }]);
      }
      return createQueryBuilder(null);
    });

    await updateCategoryAction({
      id: 'cat1',
      input: { name: 'Food', type: 'expense', color: '#fff', type_id: 'ct1' },
    });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categories,
      mutationRevalidateProfile
    );
  });

  it('deleteCategoryAction revalidates categories', async () => {
    const { deleteCategoryAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.categories) {
        return createQueryBuilder([{ id: 'cat1' }]);
      }
      return createQueryBuilder(null);
    });

    await deleteCategoryAction({ id: 'cat1' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categories,
      mutationRevalidateProfile
    );
  });

  it('createCategoryTypeAction revalidates category-types', async () => {
    const { createCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([{ id: 'ct1', name: 'Goods', icon: 'circle' }]);
      }
      return createQueryBuilder(null);
    });

    await createCategoryTypeAction({ name: 'Goods' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categoryTypes,
      mutationRevalidateProfile
    );
  });

  it('updateCategoryTypeAction revalidates category-types', async () => {
    const { updateCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([{ id: 'ct1' }]);
      }
      return createQueryBuilder(null);
    });

    await updateCategoryTypeAction({ id: 'ct1', input: { name: 'Goods' } });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categoryTypes,
      mutationRevalidateProfile
    );
  });

  it('deleteCategoryTypeAction revalidates category-types', async () => {
    const { deleteCategoryTypeAction } = await import('@/app/actions/categories');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'category_types') {
        return createQueryBuilder([{ id: 'ct1' }]);
      }
      return createQueryBuilder(null);
    });

    await deleteCategoryTypeAction({ id: 'ct1' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.categoryTypes,
      mutationRevalidateProfile
    );
  });

  it('createTransactionAction revalidates transactions and dashboard', async () => {
    const { createTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'USD' });
      }
      if (table === 'transactions') {
        return createQueryBuilder(null);
      }
      return createQueryBuilder(null);
    });

    await createTransactionAction({
      amount: 100,
      currencyId: '123e4567-e89b-12d3-a456-426614174000',
      exchangeRate: 1,
      amountUsd: 100,
      rateProvider: EExchangeRateProvider.PrivatBank,
      type: 'expense',
      date: '2026-06-20',
      description: null,
    });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.transactions,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.dashboard,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/dashboard/transactions');
  });

  it('updateTransactionAction revalidates transactions and dashboard', async () => {
    const { updateTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ id: 'receiver-1', status: 'approved', role: 'sender' });
      }
      if (table === 'currencies') {
        return createQueryBuilder({ code: 'USD' });
      }
      if (table === 'transactions') {
        return createQueryBuilder([{ id: 't1' }]);
      }
      return createQueryBuilder(null);
    });

    await updateTransactionAction({
      id: 't1',
      input: {
        amount: 100,
        currencyId: '123e4567-e89b-12d3-a456-426614174000',
        exchangeRate: 1,
        amountUsd: 100,
        rateProvider: EExchangeRateProvider.PrivatBank,
        type: 'expense',
        date: '2026-06-20',
        description: null,
        receiverId: 'receiver-1',
      },
    });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.transactions,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.dashboard,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/dashboard/transactions');
  });

  it('deleteTransactionAction revalidates transactions and dashboard', async () => {
    const { deleteTransactionAction } = await import('@/app/actions/transactions');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved' });
      }
      if (table === CACHE_TAGS.transactions) {
        return createQueryBuilder([{ id: 't1' }]);
      }
      return createQueryBuilder(null);
    });

    await deleteTransactionAction({ id: 't1' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.transactions,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.dashboard,
      mutationRevalidateProfile
    );
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/dashboard/transactions');
  });
});
