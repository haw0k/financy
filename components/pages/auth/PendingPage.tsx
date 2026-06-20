'use client';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { Button } from '@/lib/shadcn';
import { signOutAction } from '@/app/actions/auth';
import { useRoleContext } from '@/components/providers';
import { AUTH_MSGS } from '@/messages';
import { showError } from '@/components/ui';
import { ERole } from '@/enums';

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
      <div className="w-full max-w-md text-center border rounded-lg p-8 bg-card text-card-foreground shadow">
        <h1 className="text-2xl font-bold mb-4">Account Status</h1>
        {role === ERole.Admin ? (
          <p className="text-muted-foreground mb-6">
            Check your email to confirm your admin account. Once confirmed, you can access the admin
            dashboard.
          </p>
        ) : (
          <p className="text-muted-foreground mb-6">
            Your account is pending admin approval. You will receive a confirmation email once
            approved.
          </p>
        )}
        <Button onClick={handleLogout} variant="outline">
          Log out
        </Button>
      </div>
    </div>
  );
}
