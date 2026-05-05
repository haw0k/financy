'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/lib/shadcn';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/hooks';
import { ERole } from '@/enums';
import { routes } from '@/config';

export default function PendingPage() {
  const { role, isLoading } = useRole();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  };

  if (isLoading) {
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
