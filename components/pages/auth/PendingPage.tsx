'use client';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn';
import { signOutAction } from '@/app/actions/auth';
import { useRoleContext } from '@/components/providers';
import { AUTH_MSGS } from '@/messages';
import { showError } from '@/components/ui';

export function PendingPage() {
  const { isLoaded } = useRoleContext();

  const handleLogout = async () => {
    try {
      await signOutAction();
    } catch (error) {
      if (isRedirectError(error)) throw error;
      showError('Logout', AUTH_MSGS.TIMEOUT);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-md text-center border">
        <CardHeader>
          <CardTitle className="text-2xl">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
