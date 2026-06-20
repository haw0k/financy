import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ERole } from '@/enums';

/* ── Mocks ─────────────────────────────────────────────────────── */

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
      },
      from: mockFrom,
    }),
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('@/lib/with-timeout', () => ({
  withTimeout: <T,>(p: Promise<T>) => p,
}));

vi.mock('@/config', async () => {
  const actual = await vi.importActual<typeof import('@/config')>('@/config');
  return {
    ...actual,
    getSupabaseRedirectUrl: () => 'http://localhost:3000/auth/callback',
  };
});

const mockShowError = vi.fn();
vi.mock('@/components/ui/ToastNotification', () => ({
  showError: mockShowError,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

/* ── withTimeout unit tests ────────────────────────────────────── */

describe('withTimeout', () => {
  let withTimeout: typeof import('@/lib/with-timeout').withTimeout;

  beforeAll(async () => {
    const mod = await vi.importActual<typeof import('@/lib/with-timeout')>('@/lib/with-timeout');
    withTimeout = mod.withTimeout;
  });

  it('should resolve with the promise value when resolved within timeout', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 1000);
    expect(result).toBe('ok');
  });

  it('should reject with timeout error when promise exceeds timeout', async () => {
    const slow = new Promise((resolve) => setTimeout(resolve, 200));
    await expect(withTimeout(slow, 50)).rejects.toThrow('Request timed out');
  });
});

/* ── Server action unit tests ──────────────────────────────────── */

describe('loginAction', () => {
  it('should return validation error for invalid email', async () => {
    const { loginAction } = await import('@/app/actions/auth');
    const result = await loginAction({ email: 'invalid', password: 'password123' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('should return validation error for short password', async () => {
    const { loginAction } = await import('@/app/actions/auth');
    const result = await loginAction({ email: 'test@test.com', password: '12345' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('should return error on signInWithPassword failure', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    const { loginAction } = await import('@/app/actions/auth');
    const result = await loginAction({ email: 'test@test.com', password: 'password123' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid credentials');
    }
  });

  it('should return fallback message when error has no message', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: {} });
    const { loginAction } = await import('@/app/actions/auth');
    const result = await loginAction({ email: 'test@test.com', password: 'password123' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Authentication failed. Please try again.');
    }
  });

  it('should call signInWithPassword and redirect on success', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    const { loginAction } = await import('@/app/actions/auth');
    await expect(loginAction({ email: 'test@test.com', password: 'password123' })).rejects.toThrow(
      'NEXT_REDIRECT'
    );
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});

describe('signUpAction', () => {
  it('should return validation error for invalid email', async () => {
    const { signUpAction } = await import('@/app/actions/auth');
    const result = await signUpAction({
      email: 'bad-email',
      password: 'password123',
      role: ERole.Sender,
    });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should return validation error for admin role', async () => {
    const { signUpAction } = await import('@/app/actions/auth');
    const result = await signUpAction({
      email: 'test@test.com',
      password: 'password123',
      role: ERole.Admin,
    });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBeDefined();
    }
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should return error on signUp failure', async () => {
    mockSignUp.mockResolvedValueOnce({ error: { message: 'Email already registered' } });
    const { signUpAction } = await import('@/app/actions/auth');
    const result = await signUpAction({
      email: 'test@test.com',
      password: 'password123',
      role: ERole.Sender,
    });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Email already registered');
    }
  });

  it('should call signUp with role data and redirect on success', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    const { signUpAction } = await import('@/app/actions/auth');
    await expect(
      signUpAction({ email: 'test@test.com', password: 'password123', role: ERole.Receiver })
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
      options: { data: { role: 'receiver' } },
    });
  });
});

describe('adminLoginAction', () => {
  it('should return error on signInWithPassword failure', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    const { adminLoginAction } = await import('@/app/actions/auth');
    const result = await adminLoginAction({ email: 'admin@test.com', password: 'wrongpass' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Invalid credentials');
    }
  });

  it('should call signInWithPassword and redirect to admin on success', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { app_metadata: { role: 'admin' } } },
    });
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    const { adminLoginAction } = await import('@/app/actions/auth');
    await expect(
      adminLoginAction({ email: 'admin@test.com', password: 'adminpass123' })
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: 'adminpass123',
    });
    expect(mockRedirect).toHaveBeenCalledWith('/admin');
  });

  it('should redirect non-admin users to dashboard', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: { app_metadata: { role: 'sender' } } },
    });
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    const { adminLoginAction } = await import('@/app/actions/auth');
    await expect(
      adminLoginAction({ email: 'sender@test.com', password: 'senderpass123' })
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
  });
});

describe('adminSignUpAction', () => {
  const mockAdminCheck = {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
  };

  it('should return { isSuccess: true } on success without redirect', async () => {
    mockFrom.mockReturnValueOnce(mockAdminCheck);
    mockSignUp.mockResolvedValueOnce({ error: null });
    const { adminSignUpAction } = await import('@/app/actions/auth');
    const result = await adminSignUpAction({
      email: 'admin@test.com',
      password: 'adminpass123',
    });
    expect(result.isSuccess).toBe(true);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should return error when admin already exists', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() =>
                Promise.resolve({ data: { id: 'existing-admin' }, error: null })
              ),
            })),
          })),
        })),
      })),
    });
    const { adminSignUpAction } = await import('@/app/actions/auth');
    const result = await adminSignUpAction({
      email: 'newadmin@test.com',
      password: 'adminpass123',
    });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('An admin account already exists');
    }
  });

  it('should return error on signUp failure', async () => {
    mockFrom.mockReturnValueOnce(mockAdminCheck);
    mockSignUp.mockResolvedValueOnce({ error: { message: 'Signup failed' } });
    const { adminSignUpAction } = await import('@/app/actions/auth');
    const result = await adminSignUpAction({
      email: 'admin@test.com',
      password: 'adminpass123',
    });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error).toBe('Signup failed');
    }
  });
});

/* ── Form component tests ──────────────────────────────────────── */

describe('LoginPage', () => {
  it('should show error on login failure', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    const { LoginPage } = await import('@/components/pages/auth/LoginPage');
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Login', 'Invalid credentials');
    });
  });

  it('should show loading state during submission', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'fail' } });
    const { LoginPage } = await import('@/components/pages/auth/LoginPage');
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeDefined();
    });
  });
});

describe('SignUpPage', () => {
  it('should show password mismatch error without calling server action', async () => {
    const { SignUpPage } = await import('@/components/pages/auth/SignUpPage');
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Repeat Password'), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(mockShowError).toHaveBeenCalledWith('Sign up', 'Passwords do not match');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should show error on sign-up failure', async () => {
    mockSignUp.mockResolvedValueOnce({ error: { message: 'Email already registered' } });
    const { SignUpPage } = await import('@/components/pages/auth/SignUpPage');
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Repeat Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Sign up', 'Email already registered');
    });
  });
});

describe('AdminAuthPage', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  it('should render login form when admin exists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: true }),
    });
    const { AdminAuthPage } = await import('@/components/pages/auth/AdminAuthPage');
    render(<AdminAuthPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Login' })).toBeDefined();
    });
  });

  it('should render signup form when admin does not exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });
    const { AdminAuthPage } = await import('@/components/pages/auth/AdminAuthPage');
    render(<AdminAuthPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Sign Up')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Sign up' })).toBeDefined();
    });
  });

  it('should show error on admin login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: true }),
    });
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    const { AdminAuthPage } = await import('@/components/pages/auth/AdminAuthPage');
    render(<AdminAuthPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Admin', 'Invalid credentials');
    });
  });

  it('should show success message on admin signup', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });
    mockFrom.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    });
    mockSignUp.mockResolvedValueOnce({ error: null });
    const { AdminAuthPage } = await import('@/components/pages/auth/AdminAuthPage');
    render(<AdminAuthPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Sign Up')).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'adminpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(screen.getByText('Check your email to confirm your admin account.')).toBeDefined();
    });
  });
});
