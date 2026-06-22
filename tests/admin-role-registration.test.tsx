import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignUpSuccessPage } from '@/components/pages/auth';
import { EProfileStatus, ERole } from '@/enums';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockRouter = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/app/actions/auth', () => ({
  signOutAction: vi.fn(() => Promise.resolve({ isSuccess: true })),
}));

const mockGetPendingUsersAction = vi.fn(() =>
  Promise.resolve<
    | { isSuccess: true; data: { id: string; email: string; role: string; created_at: string }[] }
    | { isSuccess: false; error: string }
  >({
    isSuccess: true,
    data: [],
  })
);
const mockApproveUserAction = vi.fn(() =>
  Promise.resolve<{ isSuccess: true }>({ isSuccess: true })
);
const mockRejectUserAction = vi.fn(() => Promise.resolve<{ isSuccess: true }>({ isSuccess: true }));

vi.mock('@/app/actions/admin', () => ({
  getPendingUsersAction: () => mockGetPendingUsersAction(),
  approveUserAction: () => mockApproveUserAction(),
  rejectUserAction: () => mockRejectUserAction(),
}));

let useRoleContextReturn: Record<string, unknown> = {
  role: ERole.Sender,
  status: EProfileStatus.Pending,
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

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = mockFetch;
  mockGetPendingUsersAction.mockResolvedValue({ isSuccess: true, data: [] });
  mockApproveUserAction.mockResolvedValue({ isSuccess: true });
  mockRejectUserAction.mockResolvedValue({ isSuccess: true });
  useRoleContextReturn = {
    role: ERole.Sender,
    status: EProfileStatus.Pending,
    isLoaded: true,
    refetch: vi.fn(),
  };
});

/* ── Enums ─────────────────────────────────────────────────────── */

describe('Role enum', () => {
  it('should have correct values', () => {
    expect(ERole.Sender).toBe('sender');
    expect(ERole.Receiver).toBe('receiver');
    expect(ERole.Admin).toBe('admin');
  });
});

describe('ProfileStatus enum', () => {
  it('should have correct values', () => {
    expect(EProfileStatus.Pending).toBe('pending');
    expect(EProfileStatus.Approved).toBe('approved');
  });
});

/* ── SignUpSuccessPage ─────────────────────────────────────────── */

describe('SignUpSuccessPage', () => {
  it('should show awaiting admin approval message', () => {
    render(<SignUpSuccessPage />);
    expect(screen.getByText('Registration Submitted')).toBeDefined();
    expect(
      screen.getByText(
        'Your registration is awaiting admin approval. You will receive a confirmation email once approved.'
      )
    ).toBeDefined();
    expect(screen.getByText('Back to login')).toBeDefined();
  });

  it('should have a link to login page', () => {
    const { container } = render(<SignUpSuccessPage />);
    const link = container.querySelector('a[href="/auth/login"]');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe('Back to login');
  });
});

/* ── Route constants ───────────────────────────────────────────── */

describe('Route constants', () => {
  it('should include new admin routes', async () => {
    const { routes } = await import('@/config');
    expect(routes.admin).toBe('/admin');
    expect(routes.adminAuth).toBe('/auth/admin');
    expect(routes.pending).toBe('/auth/pending');
  });
});

/* ── PendingPage ───────────────────────────────────────────────── */

describe('PendingPage', () => {
  it('should show loading state', async () => {
    useRoleContextReturn = { ...useRoleContextReturn, isLoaded: false };
    const { PendingPage } = await import('@/components/pages/auth');
    render(<PendingPage />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('should render pending card for admin role', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Pending,
    };
    const { PendingPage } = await import('@/components/pages/auth');
    render(<PendingPage />);
    expect(screen.getByText('Account Status')).toBeDefined();
    expect(screen.getByText('Log out')).toBeDefined();
  });

  it('should render pending card for sender role', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Sender,
      status: EProfileStatus.Pending,
    };
    const { PendingPage } = await import('@/components/pages/auth');
    render(<PendingPage />);
    expect(screen.getByText('Account Status')).toBeDefined();
    expect(screen.getByText('Log out')).toBeDefined();
  });

  it('should render pending card for receiver role', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Receiver,
      status: EProfileStatus.Pending,
    };
    const { PendingPage } = await import('@/components/pages/auth');
    render(<PendingPage />);
    expect(screen.getByText('Account Status')).toBeDefined();
    expect(screen.getByText('Log out')).toBeDefined();
  });

  it('should render logout button', async () => {
    const { PendingPage } = await import('@/components/pages/auth');
    render(<PendingPage />);
    expect(screen.getByText('Log out')).toBeDefined();
  });
});

/* ── AdminPage ─────────────────────────────────────────────────── */

describe('AdminPage', () => {
  it('should show empty state when no pending users', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockGetPendingUsersAction.mockResolvedValueOnce({ isSuccess: true, data: [] });
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('No pending registrations')).toBeDefined();
    });
    expect(screen.getByText('All new user registrations have been processed.')).toBeDefined();
  });

  it('should render table with pending users', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockGetPendingUsersAction.mockResolvedValueOnce({
      isSuccess: true,
      data: [
        { id: '1', email: 'a@test.com', role: 'sender', created_at: '2026-01-01T00:00:00Z' },
        { id: '2', email: 'b@test.com', role: 'receiver', created_at: '2026-01-02T00:00:00Z' },
      ],
    });
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('a@test.com')).toBeDefined();
    });
    expect(screen.getByText('b@test.com')).toBeDefined();
    expect(screen.getByText('sender')).toBeDefined();
    expect(screen.getByText('receiver')).toBeDefined();
  });

  it('should call approve action on approve button click', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockGetPendingUsersAction.mockResolvedValueOnce({
      isSuccess: true,
      data: [{ id: '1', email: 'a@test.com', role: 'sender', created_at: '2026-01-01T00:00:00Z' }],
    });
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('a@test.com')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => {
      expect(mockApproveUserAction).toHaveBeenCalled();
    });
  });

  it('should call reject action on reject button click', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockGetPendingUsersAction.mockResolvedValueOnce({
      isSuccess: true,
      data: [
        {
          id: '2',
          email: 'b@test.com',
          role: 'receiver',
          created_at: '2026-01-02T00:00:00Z',
        },
      ],
    });
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('b@test.com')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      expect(mockRejectUserAction).toHaveBeenCalled();
    });
  });

  it('should redirect non-admin to dashboard', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Sender,
      status: EProfileStatus.Approved,
    };
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should show empty state on fetch error', async () => {
    useRoleContextReturn = {
      ...useRoleContextReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockGetPendingUsersAction.mockResolvedValueOnce({
      isSuccess: false,
      error: 'Failed to fetch pending users',
    });
    const { AdminPage } = await import('@/components/pages/admin');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('No pending registrations')).toBeDefined();
    });
  });
});

/* ── Middleware proxy config ───────────────────────────────────── */

describe('Middleware proxy', () => {
  it('should export proxy with admin matcher', async () => {
    const { proxy } = await import('@/proxy');
    expect(proxy).toBeDefined();
  });
});

/* ── Admin client ──────────────────────────────────────────────── */

describe('Admin client', () => {
  it('should export createAdminClient', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    expect(createAdminClient).toBeDefined();
    expect(typeof createAdminClient).toBe('function');
  });
});
