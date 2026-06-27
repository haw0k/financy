'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config';

export function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(routes.login);
  }, [router]);

  return null;
}
