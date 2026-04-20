import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
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
            <CardTitle>About</CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Application</label>
              <p className="text-sm font-medium">Financy v1.0</p>
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
