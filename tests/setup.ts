import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('next/cache', () => ({
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  revalidateTag: vi.fn(),
}));

afterEach(() => {
  cleanup();
});
