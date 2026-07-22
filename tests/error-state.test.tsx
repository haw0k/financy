import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

const { ErrorState } = await import('@/components/ui/ErrorState');

describe('ErrorState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<ErrorState title="Load failed" description="Could not fetch data" />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Load failed')).toBeDefined();
    expect(screen.getByText('Could not fetch data')).toBeDefined();
  });

  it('renders default title and description when none provided', () => {
    render(<ErrorState />);

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('An unexpected error occurred. Please try again later.')).toBeDefined();
  });

  it('does not render retry button by default', () => {
    render(<ErrorState title="Load failed" description="Could not fetch data" />);

    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
  });

  it('renders retry button when retry is true and calls router.refresh on click', () => {
    render(<ErrorState title="Load failed" description="Could not fetch data" retry />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeDefined();

    fireEvent.click(retryButton);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
