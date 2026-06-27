import { redirect } from 'next/navigation';
import { AuthSuspense } from '@/components/layouts';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';
import type { PropsWithChildren } from 'react';

async function AdminAuthLoader({ children }: PropsWithChildren) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== ERole.Admin || profile.status !== EProfileStatus.Approved) {
    redirect(routes.dashboard);
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <AuthSuspense>
      <AdminAuthLoader>{children}</AdminAuthLoader>
    </AuthSuspense>
  );
}
