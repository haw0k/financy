import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EProfileStatus, ERole } from '@/enums';

/* ── Mocks ───────────────────────────────────────────────────────── */

const mockUser = { id: 'admin-1' };
const mockGetUser = vi.fn(() =>
  Promise.resolve({
    data: { user: { ...mockUser, email_confirmed_at: '2026-01-01T00:00:00Z' } },
    error: null,
  })
);
const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    }),
}));

const mockRouter = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

let useRoleContextReturn: Record<string, unknown> = {
  role: ERole.Admin,
  status: EProfileStatus.Approved,
  isLoaded: true,
  refetch: vi.fn(),
};

vi.mock('@/components/providers', async () => {
  const actual =
    await vi.importActual<typeof import('@/components/providers')>('@/components/providers');
  return {
    ...actual,
    useRoleContext: () => useRoleContextReturn,
  };
});

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/components/ui/ToastNotification', () => ({
  showError: mockShowError,
  showSuccess: mockShowSuccess,
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
    then: thenable.then.bind(thenable),
    catch: thenable.catch.bind(thenable),
    finally: thenable.finally.bind(thenable),
  });

  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockReturnValue(
    Promise.resolve({
      data: { user: { ...mockUser, email_confirmed_at: '2026-01-01T00:00:00Z' } },
      error: null,
    })
  );
  mockRpc.mockResolvedValue({ data: null, error: null });
  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return createQueryBuilder({ status: 'approved', role: 'admin' });
    }
    return createQueryBuilder(null);
  });
  useRoleContextReturn = {
    role: ERole.Admin,
    status: EProfileStatus.Approved,
    isLoaded: true,
    refetch: vi.fn(),
  };
});

/* ── Full approve-flow integration tests ───────────────────────────── */

describe('approve user flow', () => {
  it('should render pending users and approve one via AdminPage', async () => {
    const pendingUser = {
      id: 'user-2',
      email: 'sender@test.com',
      role: ERole.Sender,
      created_at: '2026-06-01T00:00:00Z',
    };

    // Mock the admin actions module so getPendingUsersAction returns the pending user
    // and approveUserAction resolves and revalidates as the real implementation would.
    const actions = await import('@/app/actions/admin');
    vi.spyOn(actions, 'getPendingUsersAction').mockImplementation(() =>
      Promise.resolve({ isSuccess: true, data: [pendingUser] })
    );
    vi.spyOn(actions, 'approveUserAction').mockImplementation(() =>
      Promise.resolve({ isSuccess: true, data: undefined })
    );

    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('sender@test.com')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(actions.approveUserAction).toHaveBeenCalledWith({ userId: pendingUser.id });
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalledWith('Admin', 'User approved');
    });

    // revalidateTag is called inside the real approveUserAction; when the action is
    // mocked we verify the action itself was invoked and rely on admin-server-actions.test.ts
    // to check the revalidation call.
    expect(actions.approveUserAction).toHaveBeenCalledTimes(1);
  });

  it('should show error when approve RPC fails', async () => {
    const actions = await import('@/app/actions/admin');
    vi.spyOn(actions, 'getPendingUsersAction').mockImplementation(() =>
      Promise.resolve({
        isSuccess: true,
        data: [
          {
            id: 'user-2',
            email: 'sender@test.com',
            role: ERole.Sender,
            created_at: '2026-06-01T00:00:00Z',
          },
        ],
      })
    );
    vi.spyOn(actions, 'approveUserAction').mockImplementation(() =>
      Promise.resolve({ isSuccess: false, error: 'Approval failed' })
    );

    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('sender@test.com')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Admin', 'Approval failed');
    });
  });

  it('should reject approving non-pending target at validation stage', async () => {
    const actions = await import('@/app/actions/admin');
    vi.spyOn(actions, 'getPendingUsersAction').mockImplementation(() =>
      Promise.resolve({
        isSuccess: true,
        data: [
          {
            id: 'user-2',
            email: 'already-approved@test.com',
            role: ERole.Sender,
            created_at: '2026-06-01T00:00:00Z',
          },
        ],
      })
    );
    vi.spyOn(actions, 'approveUserAction').mockImplementation(() =>
      Promise.resolve({ isSuccess: false, error: 'User is not pending approval' })
    );

    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('already-approved@test.com')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Admin', 'User is not pending approval');
    });

    expect(actions.approveUserAction).toHaveBeenCalledWith({ userId: 'user-2' });
  });
});
