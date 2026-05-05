import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignUpSuccessPage from '@/components/pages/auth/SignUpSuccessPage';
import { ERole } from '@/enums';
import { EProfileStatus } from '@/enums';

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

describe('Route constants', () => {
  it('should include new admin routes', async () => {
    const { routes } = await import('@/config');
    expect(routes.admin).toBe('/admin');
    expect(routes.adminAuth).toBe('/auth/admin');
    expect(routes.pending).toBe('/auth/pending');
  });
});
