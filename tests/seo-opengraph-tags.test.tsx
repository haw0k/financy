import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  document.head.innerHTML = '';
});

describe('createMetadata', () => {
  it('should produce OpenGraph and Twitter Card tags with the social preview image', async () => {
    const { createMetadata } = await import('@/lib/metadata');
    const metadata = createMetadata({
      title: 'Track Your Finances',
      path: '/',
    });

    expect(metadata.openGraph?.images).toBeDefined();
    const images = metadata.openGraph?.images;
    const imageUrl = Array.isArray(images) ? images[0] : images;
    expect(imageUrl).toEqual(
      expect.objectContaining({
        url: expect.stringContaining('/social-preview.png'),
      })
    );
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        images: expect.any(Array),
        card: 'summary_large_image',
      })
    );
  });

  it('should mark noIndex pages as non-indexable', async () => {
    const { createMetadata } = await import('@/lib/metadata');
    const metadata = createMetadata({ noIndex: true });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('should generate a canonical URL from the provided path', async () => {
    const { createMetadata } = await import('@/lib/metadata');
    const metadata = createMetadata({ path: '/auth/login' });

    expect(metadata.alternates?.canonical).toContain('/auth/login');
  });
});

describe('HomePage metadata', () => {
  it('should include the site name and social preview image', async () => {
    const HomePageModule = await import('@/app/page');
    const metadata = HomePageModule.metadata;

    expect(metadata.title).toContain('Financy');
    expect(metadata.openGraph?.images).toBeDefined();
    const images = metadata.openGraph?.images;
    const imageUrl = Array.isArray(images) ? images[0] : images;
    expect(imageUrl).toEqual(
      expect.objectContaining({
        url: expect.stringContaining('/social-preview.png'),
      })
    );
  });
});

describe('LoginPage metadata', () => {
  it('should have a login title and noIndex directive', async () => {
    const LoginPageModule = await import('@/app/(auth)/auth/login/page');
    const metadata = LoginPageModule.metadata;

    expect(metadata.title).toContain('Login');
    expect(metadata.title).toContain('Financy');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe('SignUpPage metadata', () => {
  it('should have a sign-up title and noIndex directive', async () => {
    const SignUpPageModule = await import('@/app/(auth)/auth/sign-up/page');
    const metadata = SignUpPageModule.metadata;

    expect(metadata.title).toContain('Sign Up');
    expect(metadata.title).toContain('Financy');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
