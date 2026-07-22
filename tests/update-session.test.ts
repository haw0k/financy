import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

/* ── Mocks ───────────────────────────────────────────────────────── */

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/config', () => ({
  env: {
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
  },
  routes: {
    dashboard: '/dashboard',
    transactions: '/dashboard/transactions',
    categories: '/dashboard/categories',
    settings: '/dashboard/settings',
    login: '/auth/login',
    signUp: '/auth/sign-up',
    signUpSuccess: '/auth/sign-up-success',
    authCallback: '/auth/callback',
    authError: '/auth/error',
    admin: '/admin',
    adminAuth: '/auth/admin',
    pending: '/auth/pending',
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => {
    const client = {
      auth: { getUser: mockGetUser },
      from: mockFrom,
    };
    return client;
  }),
}));

function createRequest(pathname: string, search = '') {
  const url = new URL(`http://localhost:3000${pathname}${search}`);
  return new NextRequest(url, { method: 'GET' });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  });
});

/* ── updateSession tests ─────────────────────────────────────────── */

describe('updateSession', () => {
  it('should pass through public routes without redirect', async () => {
    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest('/');

    const response = await updateSession(request);

    // Public routes are not matched by the middleware config, but if updateSession
    // is invoked directly it still refreshes the session and returns passthrough.
    expect(response.status).toBe(200);
  });

  it('should redirect anonymous users from /admin to login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(mockGetUser).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/login');
  });

  it('should redirect unconfirmed admin to pending page', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-1',
          email_confirmed_at: null,
          app_metadata: { role: ERole.Admin, status: EProfileStatus.Approved },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/pending');
  });

  it('should allow approved admin into /admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: { role: ERole.Admin, status: EProfileStatus.Approved },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });

  it('should redirect non-admin user from /admin to dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: { role: ERole.Sender, status: EProfileStatus.Approved },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('should redirect pending user from /dashboard to pending', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: { role: ERole.Sender, status: EProfileStatus.Pending },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.dashboard);

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/pending');
  });

  it('should redirect admin from /dashboard to /admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: { role: ERole.Admin, status: EProfileStatus.Approved },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.dashboard);

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin');
  });

  it('should allow approved sender into /dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: { role: ERole.Sender, status: EProfileStatus.Approved },
        },
      },
      error: null,
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.dashboard);

    const response = await updateSession(request);

    expect(response.status).toBe(200);
  });

  it('should fall back to database when JWT claims are missing', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-1',
          email_confirmed_at: '2026-01-01T00:00:00Z',
          app_metadata: {},
        },
      },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: { role: ERole.Admin, status: EProfileStatus.Approved },
              error: null,
            })
          ),
        })),
      })),
    });

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(response.status).toBe(200);
  });

  it('should treat getUser errors as unauthenticated and redirect /admin to login', async () => {
    mockGetUser.mockRejectedValue(new Error('Supabase unreachable'));

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest(routes.admin);

    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/login');
  });

  it('should return passthrough response when Supabase env vars are missing', async () => {
    // Simulate unconfigured env vars by mocking the config module with empty values.
    vi.doMock('@/config', () => ({
      env: {
        supabaseUrl: undefined,
        supabaseAnonKey: undefined,
      },
      routes: {
        dashboard: '/dashboard',
        transactions: '/dashboard/transactions',
        categories: '/dashboard/categories',
        settings: '/dashboard/settings',
        login: '/auth/login',
        signUp: '/auth/sign-up',
        signUpSuccess: '/auth/sign-up-success',
        authCallback: '/auth/callback',
        authError: '/auth/error',
        admin: '/admin',
        adminAuth: '/auth/admin',
        pending: '/auth/pending',
      },
    }));

    const { updateSession } = await import('@/lib/supabase/update-session');
    const request = createRequest('/dashboard');

    const response = await updateSession(request);

    // The function should not call the real Supabase client when env vars are missing.
    // We assert only the passthrough status because the createServerClient mock is still active.
    expect(response.status).toBe(200);
  });
});

/* ── proxy tests ─────────────────────────────────────────────────── */

describe('proxy', () => {
  it('should export proxy function and config matcher', async () => {
    const { proxy, config } = await import('@/proxy');

    expect(proxy).toBeDefined();
    expect(typeof proxy).toBe('function');
    expect(config.matcher).toContain('/dashboard/:path*');
    expect(config.matcher).toContain('/admin/:path*');
  });
});
