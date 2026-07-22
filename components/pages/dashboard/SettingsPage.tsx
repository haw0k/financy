import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThemeSelect } from '@/components/ui/ThemeSelect';
import { mapSupabaseError } from '@/lib/db-errors';
import { requireApprovedUser } from '@/lib/require-auth';
import { routes, siteConfig } from '@/config';

export async function SettingsPage() {
  const authResult = await requireApprovedUser();
  if ('error' in authResult) {
    redirect(routes.login);
  }

  const userResponse = await authResult.supabase.auth.getUser();
  if (userResponse.error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState
          title="Failed to load account"
          description={mapSupabaseError(userResponse.error)}
          retry
        />
      </div>
    );
  }

  const user = userResponse.data.user;
  const { data: profile, error: profileError } = await authResult.supabase
    .from('profiles')
    .select('role')
    .eq('id', authResult.userId)
    .maybeSingle();

  if (profileError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState
          title="Failed to load profile"
          description={mapSupabaseError(profileError)}
          retry
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">System</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSelect />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-sm font-medium capitalize">{profile?.role}</p>
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
            <CardTitle className="text-xl">About</CardTitle>
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
