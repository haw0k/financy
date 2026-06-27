import { type PropsWithChildren, Suspense } from 'react';

/**
 * Wraps auth-dependent children in a Suspense boundary so the static shell can
 * prerender while session/role data resolves at request time. A plain background
 * fallback avoids rendering the real app outside of its providers.
 */
export function AuthSuspense({ children }: PropsWithChildren) {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}>{children}</Suspense>;
}
