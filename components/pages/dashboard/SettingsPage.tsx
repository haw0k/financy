import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn';

import { ThemeSelect } from '@/components/ui/ThemeSelect';

import { createClient } from '@/lib/supabase/server';

import { routes, siteConfig } from '@/config';
import { EProfileStatus, ERole } from '@/enums';

export async function SettingsPage() {
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

  if (!profile || profile.status !== EProfileStatus.Approved || profile.role === ERole.Admin) {
    redirect(profile?.role === ERole.Admin ? routes.admin : routes.pending);
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSelect />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-sm font-medium capitalize">{profile.role}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-sm font-medium">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Application</label>
              <p className="text-sm font-medium">
                {siteConfig.name} {siteConfig.version}
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm text-muted-foreground">
                A simple and effective financial tracking application to manage your income and
                expenses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
