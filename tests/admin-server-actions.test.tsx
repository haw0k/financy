import { revalidateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CACHE_TAGS, mutationRevalidateProfile } from '@/config';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockUser = { id: '11111111-1111-1111-1111-111111111111' };
let mockUserEmailConfirmedAt: string | null = '2026-01-01T00:00:00Z';
const mockGetUser = vi.fn(() =>
  Promise.resolve<{
    data: { user: { id: string; email_confirmed_at?: string | null } | null };
    error: null;
  }>({
    data: { user: { ...mockUser, email_confirmed_at: mockUserEmailConfirmedAt } },
    error: null,
  })
);
const mockFrom = vi.fn();
const mockUpdateUserById = vi.fn();
const mockDeleteUser = vi.fn();

const mockRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
        deleteUser: mockDeleteUser,
      },
    },
  }),
}));

function createQueryBuilder<T>(data: T, error: unknown = null) {
  const builder: Record<string, unknown> = {};
  const thenable = Promise.resolve({ data, error });
  const method = () => builder;

  Object.assign(builder, {
    select: method,
    eq: method,
    neq: method,
    order: method,
    limit: method,
    maybeSingle: method,
    insert: method,
    update: method,
    delete: method,
    then: thenable.then.bind(thenable),
    catch: thenable.catch.bind(thenable),
    finally: thenable.finally.bind(thenable),
  });

  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReset();
  mockUserEmailConfirmedAt = '2026-01-01T00:00:00Z';
  mockGetUser.mockReturnValue(
    Promise.resolve({
      data: { user: { ...mockUser, email_confirmed_at: mockUserEmailConfirmedAt } },
      error: null,
    })
  );
  mockUpdateUserById.mockResolvedValue({ error: null });
  mockDeleteUser.mockResolvedValue({ error: null });
  mockRpc.mockResolvedValue({ data: null, error: null });
});

/* ── Approve user ────────────────────────────────────────────── */

describe('approveUserAction', () => {
  it('should reject non-admin callers', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved', role: 'sender' });
      }
      return createQueryBuilder(null);
    });

    const result = await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Forbidden');
    }
  });

  it('should reject unconfirmed admin callers', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockUserEmailConfirmedAt = null;
    mockGetUser.mockReturnValueOnce(
      Promise.resolve({
        data: { user: { ...mockUser, email_confirmed_at: null } },
        error: null,
      })
    );

    const result = await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toContain('pending');
    }
  });

  it('should reject self-approval', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }));

    const result = await approveUserAction({ userId: mockUser.id });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Cannot approve your own account');
    }
  });

  it('should reject invalid user id', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom.mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }));

    const result = await approveUserAction({ userId: 'not-a-uuid' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid user id');
    }
  });

  it('should reject targets that are not pending', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'sender' }));

    const result = await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('User is not pending approval');
    }
  });

  it('should reject admin targets', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'admin' }));

    const result = await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Cannot manage another admin account');
    }
  });

  it('should approve a pending non-admin user', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }))
      .mockReturnValueOnce(createQueryBuilder(null));

    const result = await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('approve_pending_user', {
      target_user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    });
  });
});

/* ── Reject user ───────────────────────────────────────────────── */

describe('rejectUserAction', () => {
  it('should reject non-admin callers', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createQueryBuilder({ status: 'approved', role: 'sender' });
      }
      return createQueryBuilder(null);
    });

    const result = await rejectUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Forbidden');
    }
  });

  it('should reject unconfirmed admin callers', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockUserEmailConfirmedAt = null;
    mockGetUser.mockReturnValueOnce(
      Promise.resolve({
        data: { user: { ...mockUser, email_confirmed_at: null } },
        error: null,
      })
    );

    const result = await rejectUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toContain('pending');
    }
  });

  it('should reject self-rejection', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }));

    const result = await rejectUserAction({ userId: mockUser.id });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Cannot reject your own account');
    }
  });

  it('should reject invalid user id', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockFrom.mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }));

    const result = await rejectUserAction({ userId: 'not-a-uuid' });

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid user id');
    }
  });

  it('should reject a pending non-admin user', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }));

    const result = await rejectUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(result.isSuccess).toBe(true);
    expect(mockDeleteUser).toHaveBeenCalledWith('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
  });
});

/* ── Cache revalidation ─────────────────────────────────────────── */

describe('cache revalidation', () => {
  it('approveUserAction revalidates receivers', async () => {
    const { approveUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }))
      .mockReturnValueOnce(createQueryBuilder(null));

    await approveUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.receivers,
      mutationRevalidateProfile
    );
  });

  it('rejectUserAction revalidates receivers', async () => {
    const { rejectUserAction } = await import('@/app/actions/admin');

    mockFrom
      .mockReturnValueOnce(createQueryBuilder({ status: 'approved', role: 'admin' }))
      .mockReturnValueOnce(createQueryBuilder({ status: 'pending', role: 'sender' }));

    await rejectUserAction({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' });

    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(
      CACHE_TAGS.receivers,
      mutationRevalidateProfile
    );
  });
});
