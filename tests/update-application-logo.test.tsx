import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ── Mocks ───────────────────────────────────────────────────────── */

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/components/providers', async () => {
  const actual =
    await vi.importActual<typeof import('@/components/providers')>('@/components/providers');
  return {
    ...actual,
    useMobileNav: () => ({ isOpen: false, setIsOpen: vi.fn() }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePathname.mockReturnValue('/dashboard');
});

/* ── LogoLink ───────────────────────────────────────────────────── */

describe('LogoLink', () => {
  it('should render the new SVG logo asset', async () => {
    const { LogoLink } = await import('@/components/ui/LogoLink');
    render(<LogoLink />);

    const image = screen.getByRole('img', { name: /financy/i });
    expect(image).toBeDefined();
    expect(image.getAttribute('src')).toContain('logo.svg');
  });
});

/* ── Auth pages ─────────────────────────────────────────────────── */

describe('LoginPage', () => {
  it('should display the new logo', async () => {
    const { LoginPage } = await import('@/components/pages/auth/LoginPage');
    render(<LoginPage />);

    const logo = screen.getByRole('img', { name: /financy/i });
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toContain('logo.svg');
  });
});

describe('SignUpPage', () => {
  it('should display the new logo', async () => {
    const { SignUpPage } = await import('@/components/pages/auth/SignUpPage');
    render(<SignUpPage />);

    const logo = screen.getByRole('img', { name: /financy/i });
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toContain('logo.svg');
  });
});

/* ── Dashboard navigation / header ───────────────────────────────── */

describe('DashboardNav', () => {
  it('should display the new logo in the dashboard navigation', async () => {
    const { DashboardNav } = await import('@/components/layouts/DashboardNav');
    render(<DashboardNav />);

    const logo = screen.getByRole('img', { name: /financy/i });
    expect(logo).toBeDefined();
    expect(logo.getAttribute('src')).toContain('logo.svg');
  });
});
