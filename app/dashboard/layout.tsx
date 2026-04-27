import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav, Header, MobileNav } from '@/components/layouts';
import { routes } from '@/config';
import { DashboardShell } from '@/components/providers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  return (
    <DashboardShell>
      <div className="flex min-h-screen w-full">
        <DashboardNav />
        <div className="flex-1">
          <Header user={user} />
          <main className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
        <MobileNav />
      </div>
    </DashboardShell>
  );
}
