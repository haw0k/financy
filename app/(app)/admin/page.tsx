import { redirect } from 'next/navigation';
import { AdminPage } from '@/components/pages/admin';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config';
import { ERole, EProfileStatus } from '@/enums';
import { siteConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Admin Dashboard — ${siteConfig.name}`,
  description: 'Manage user registrations and approvals',
};

export default async function AdminPageRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email_confirmed_at) {
    redirect(routes.pending);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== ERole.Admin || profile.status !== EProfileStatus.Approved) {
    redirect(routes.dashboard);
  }

  return <AdminPage />;
}
