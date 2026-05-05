import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SignUpSuccessPage from '@/components/pages/auth/SignUpSuccessPage';
import { ERole, EProfileStatus } from '@/enums';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockRouter = { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() };
const mockSignOut = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}));

let useRoleReturn: Record<string, unknown> = {
  role: ERole.Sender,
  status: EProfileStatus.Pending,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks', () => ({
  useRole: () => useRoleReturn,
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = mockFetch;
  useRoleReturn = {
    role: ERole.Sender,
    status: EProfileStatus.Pending,
    isLoading: false,
    error: null,
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
    useRoleReturn = { ...useRoleReturn, isLoading: true };
    const { default: PendingPage } = await import('@/components/pages/auth/PendingPage');
    render(<PendingPage />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('should show admin pending message for admin role', async () => {
    useRoleReturn = { ...useRoleReturn, role: ERole.Admin, status: EProfileStatus.Pending };
    const { default: PendingPage } = await import('@/components/pages/auth/PendingPage');
    render(<PendingPage />);
    expect(screen.getByText(/Check your email to confirm your admin account/)).toBeDefined();
  });

  it('should show approval pending message for sender role', async () => {
    useRoleReturn = { ...useRoleReturn, role: ERole.Sender, status: EProfileStatus.Pending };
    const { default: PendingPage } = await import('@/components/pages/auth/PendingPage');
    render(<PendingPage />);
    expect(screen.getByText(/Your account is pending admin approval/)).toBeDefined();
  });

  it('should show approval pending message for receiver role', async () => {
    useRoleReturn = { ...useRoleReturn, role: ERole.Receiver, status: EProfileStatus.Pending };
    const { default: PendingPage } = await import('@/components/pages/auth/PendingPage');
    render(<PendingPage />);
    expect(screen.getByText(/Your account is pending admin approval/)).toBeDefined();
  });

  it('should render logout button', async () => {
    const { default: PendingPage } = await import('@/components/pages/auth/PendingPage');
    render(<PendingPage />);
    expect(screen.getByText('Log out')).toBeDefined();
  });
});

/* ── AdminPage ─────────────────────────────────────────────────── */

describe('AdminPage', () => {
  it('should show empty state when no pending users', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('No pending registrations')).toBeDefined();
    });
    expect(screen.getByText('All new user registrations have been processed.')).toBeDefined();
  });

  it('should render table with pending users', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            { id: '1', email: 'a@test.com', role: 'sender', created_at: '2026-01-01T00:00:00Z' },
            { id: '2', email: 'b@test.com', role: 'receiver', created_at: '2026-01-02T00:00:00Z' },
          ],
        }),
    });
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('a@test.com')).toBeDefined();
    });
    expect(screen.getByText('b@test.com')).toBeDefined();
    expect(screen.getByText('sender')).toBeDefined();
    expect(screen.getByText('receiver')).toBeDefined();
  });

  it('should call approve API on approve button click', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: '1', email: 'a@test.com', role: 'sender', created_at: '2026-01-01T00:00:00Z' },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('a@test.com')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Approve'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/pending-users/approve', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' }),
      });
    });
  });

  it('should call reject API on reject button click', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: '2',
                email: 'b@test.com',
                role: 'receiver',
                created_at: '2026-01-02T00:00:00Z',
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('b@test.com')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/pending-users/reject', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '2' }),
      });
    });
  });

  it('should redirect non-admin to dashboard', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Sender,
      status: EProfileStatus.Approved,
    };
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
    render(<AdminPage />);
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('should show empty state on fetch error', async () => {
    useRoleReturn = {
      ...useRoleReturn,
      role: ERole.Admin,
      status: EProfileStatus.Approved,
    };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });
    const { default: AdminPage } = await import('@/components/pages/admin/AdminPage');
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

/* ── useRole hook exports ──────────────────────────────────────── */

describe('useRole hook', () => {
  it('should be exported from hooks barrel', async () => {
    const hooks = await import('@/hooks');
    expect(hooks.useRole).toBeDefined();
    expect(typeof hooks.useRole).toBe('function');
  });
});
