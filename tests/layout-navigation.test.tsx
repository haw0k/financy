import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EProfileStatus, ERole } from '@/enums';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

let useRoleContextReturn: Record<string, unknown> = {
  role: null,
  status: null,
  isLoaded: true,
  refetch: vi.fn(),
};

const mockSetIsOpen = vi.fn();

vi.mock('@/components/providers', async () => {
  const actual =
    await vi.importActual<typeof import('@/components/providers')>('@/components/providers');
  return {
    ...actual,
    useRoleContext: () => useRoleContextReturn,
    useMobileNav: () => ({ isOpen: true, setIsOpen: mockSetIsOpen }),
  };
});

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  useRoleContextReturn = {
    role: null,
    status: null,
    isLoaded: true,
    refetch: vi.fn(),
  };
});

/* ── DashboardNav ──────────────────────────────────────────────── */

describe('DashboardNav', () => {
  it('should render default nav items when no items prop is provided', async () => {
    mockUsePathname.mockReturnValue('/dashboard');
    const { DashboardNav } = await import('@/components/layouts/DashboardNav');
    render(<DashboardNav />);

    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Transactions')).toBeDefined();
    expect(screen.getByText('Categories')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('should render custom items when provided', async () => {
    mockUsePathname.mockReturnValue('/admin');
    const { DashboardNav } = await import('@/components/layouts/DashboardNav');
    const { ShieldCheckIcon } = await import('lucide-react');
    render(<DashboardNav items={[{ href: '/admin', label: 'Admin', icon: ShieldCheckIcon }]} />);

    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.queryByText('Overview')).toBeNull();
  });
});

/* ── MobileNav ─────────────────────────────────────────────────── */

describe('MobileNav', () => {
  it('should render default nav items when no items prop is provided', async () => {
    mockUsePathname.mockReturnValue('/dashboard');
    const { MobileNav } = await import('@/components/layouts/MobileNav');
    render(<MobileNav />);

    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('should render custom items when provided', async () => {
    mockUsePathname.mockReturnValue('/admin');
    const { MobileNav } = await import('@/components/layouts/MobileNav');
    const { ShieldCheckIcon } = await import('lucide-react');
    render(<MobileNav items={[{ href: '/admin', label: 'Admin', icon: ShieldCheckIcon }]} />);

    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.queryByText('Overview')).toBeNull();
  });
});

/* ── AppShell ──────────────────────────────────────────────────── */

describe('AppShell', () => {
  it('should render default dashboard nav for non-admin role', async () => {
    mockUsePathname.mockReturnValue('/dashboard');
    useRoleContextReturn = {
      role: ERole.Sender,
      status: EProfileStatus.Approved,
      isLoaded: true,
      refetch: vi.fn(),
    };
    const { AppShell } = await import('@/components/layouts/AppShell');
    render(
      <AppShell user={mockUser as unknown as import('@supabase/supabase-js').User}>
        <div>Content</div>
      </AppShell>
    );

    const desktopNav = screen.getAllByRole('navigation', { hidden: true })[0];
    expect(within(desktopNav).getByText('Overview')).toBeDefined();
    expect(within(desktopNav).getByText('Transactions')).toBeDefined();
    expect(within(desktopNav).queryByText('Admin')).toBeNull();
  });

  it('should render admin nav for approved admin role regardless of pathname', async () => {
    mockUsePathname.mockReturnValue('/admin');
    useRoleContextReturn = {
      role: ERole.Admin,
      status: EProfileStatus.Approved,
      isLoaded: true,
      refetch: vi.fn(),
    };
    const { AppShell } = await import('@/components/layouts/AppShell');
    render(
      <AppShell user={mockUser as unknown as import('@supabase/supabase-js').User}>
        <div>Content</div>
      </AppShell>
    );

    const desktopNav = screen.getAllByRole('navigation', { hidden: true })[0];
    expect(within(desktopNav).getByText('Admin')).toBeDefined();
    expect(within(desktopNav).queryByText('Overview')).toBeNull();
  });

  it('should fall back to pathname when role context is not loaded', async () => {
    mockUsePathname.mockReturnValue('/admin');
    useRoleContextReturn = {
      role: null,
      status: null,
      isLoaded: true,
      refetch: vi.fn(),
    };
    const { AppShell } = await import('@/components/layouts/AppShell');
    render(
      <AppShell user={mockUser as unknown as import('@supabase/supabase-js').User}>
        <div>Content</div>
      </AppShell>
    );

    const desktopNav = screen.getAllByRole('navigation', { hidden: true })[0];
    expect(within(desktopNav).getByText('Admin')).toBeDefined();
    expect(within(desktopNav).queryByText('Overview')).toBeNull();
  });

  it('should not show admin nav for non-admin pathname when role is sender', async () => {
    mockUsePathname.mockReturnValue('/dashboard/settings');
    useRoleContextReturn = {
      role: ERole.Sender,
      status: EProfileStatus.Approved,
      isLoaded: true,
      refetch: vi.fn(),
    };
    const { AppShell } = await import('@/components/layouts/AppShell');
    render(
      <AppShell user={mockUser as unknown as import('@supabase/supabase-js').User}>
        <div>Content</div>
      </AppShell>
    );

    const desktopNav = screen.getAllByRole('navigation', { hidden: true })[0];
    expect(within(desktopNav).getByText('Settings')).toBeDefined();
    expect(within(desktopNav).queryByText('Admin')).toBeNull();
  });
});
