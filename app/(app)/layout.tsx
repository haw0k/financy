import { redirect } from 'next/navigation';
import { AppShell, AuthSuspense } from '@/components/layouts';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config';
import type { PropsWithChildren } from 'react';

async function AppAuthLoader({ children }: PropsWithChildren) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  return <AppShell user={user}>{children}</AppShell>;
}

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <AuthSuspense>
      <AppAuthLoader>{children}</AppAuthLoader>
    </AuthSuspense>
  );
}
