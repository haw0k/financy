import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layouts';
import { routes } from '@/config';
import type { PropsWithChildren } from 'react';

export default async function AppLayout({ children }: PropsWithChildren) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  return <AppShell user={user}>{children}</AppShell>;
}
