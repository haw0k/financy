import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

/* ── Mocks ───────────────────────────────────────────────────────── */

const mockExchangeCodeForSession = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
        getUser: mockGetUser,
      },
      from: mockFrom,
    }),
}));

function createCallbackRequest(search: string) {
  const url = new URL(`http://localhost:3000${routes.authCallback}${search}`);
  return new NextRequest(url, { method: 'GET' });
}

function mockProfileSelect(role: ERole | null, status: EProfileStatus | null) {
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(() =>
          Promise.resolve({ data: role ? { role, status } : null, error: null })
        ),
      })),
    })),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockExchangeCodeForSession.mockResolvedValue({ error: null });
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
});

/* ── /auth/callback tests ────────────────────────────────────────── */

describe('/auth/callback route', () => {
  it('should redirect to error page when code is missing', async () => {
    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error');
  });

  it('should redirect to dashboard on successful code exchange without next param', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileSelect(ERole.Sender, EProfileStatus.Approved);

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=valid-code');

    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('should redirect to allowed next path when provided', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileSelect(ERole.Sender, EProfileStatus.Approved);

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=valid-code&next=/dashboard/transactions');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard/transactions');
  });

  it('should reject malicious next redirect and fall back to dashboard', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileSelect(ERole.Sender, EProfileStatus.Approved);

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=valid-code&next=https://evil.com/phish');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('should redirect approved admin to /admin regardless of next param', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    });
    mockProfileSelect(ERole.Admin, EProfileStatus.Approved);

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=valid-code&next=/dashboard');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin');
  });

  it('should redirect to auth error page when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: 'Invalid code' } });

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=invalid-code');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error');
  });

  it('should normalize next param without leading slash', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockProfileSelect(ERole.Sender, EProfileStatus.Approved);

    const { GET } = await import('@/app/(auth)/auth/callback/route');
    const request = createCallbackRequest('?code=valid-code&next=dashboard/settings');

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard/settings');
  });
});
