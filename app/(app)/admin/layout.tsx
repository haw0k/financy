import { Suspense, type PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

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
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminAuthLoader>{children}</AdminAuthLoader>
    </Suspense>
  );
}
