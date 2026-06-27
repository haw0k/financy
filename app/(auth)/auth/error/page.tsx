import { Suspense } from 'react';
import { ErrorPage } from '@/components/pages/auth';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Error — ${siteConfig.name}`,
  description: 'An error occurred during authentication',
};

export default function ErrorPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <ErrorPage searchParams={searchParams} />
    </Suspense>
  );
}
