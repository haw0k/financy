'use client';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn';

import { useRoleContext } from '@/components/providers';
import { showError } from '@/components/ui';

import { ERole } from '@/enums';
import { AUTH_MSGS } from '@/messages';

import { signOutAction } from '@/app/actions/auth';

export function PendingPage() {
  const { role, isLoaded } = useRoleContext();

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
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {role === ERole.Admin
              ? 'Check your email to confirm your admin account. Once confirmed, you can access the admin dashboard.'
              : 'Your account is pending admin approval. You will receive a confirmation email once approved.'}
          </p>
          <Button onClick={handleLogout} variant="outline">
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
