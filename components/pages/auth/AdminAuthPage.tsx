'use client';

import { useState, useEffect, useTransition, type SubmitEvent } from 'react';
import Image from 'next/image';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/lib/shadcn';
import { showError, PasswordField } from '@/components/ui';
import { siteConfig } from '@/config';
import { adminLoginAction, adminSignUpAction } from '@/app/actions/auth';
import { AUTH_MSGS } from '@/messages';
import { withTimeout } from '@/lib/with-timeout';

export function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAdminExist, setAdminExists] = useState<boolean | null>(null);
  const [isSignUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check-admin')
      .then((res) => res.json())
      .then((data) => setAdminExists(data.exists))
      .catch(() => setAdminExists(true));
  }, []);

  const handleSignUp = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await withTimeout(adminSignUpAction({ email, password }));
        if (result.isSuccess) {
          setSignUpSuccess(true);
        } else if (result.error) {
          showError('Admin', result.error);
        }
      } catch {
        showError('Admin', AUTH_MSGS.TIMEOUT);
      }
    });
  };

  const handleLogin = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await withTimeout(adminLoginAction({ email, password }));
        if (!result.isSuccess && result.error) {
          showError('Admin', result.error);
        }
      } catch {
        showError('Admin', AUTH_MSGS.TIMEOUT);
      }
    });
  };

  if (isAdminExist === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Image src="/icon.svg" alt={siteConfig.name} width={48} height={48} loading="eager" />
            <h1 className="text-2xl font-bold" style={{ color: siteConfig.accentColor }}>
              {siteConfig.name}
            </h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isAdminExist ? 'Admin Login' : 'Admin Sign Up'}
              </CardTitle>
              <CardDescription>
                {isAdminExist
                  ? 'Login to access the admin panel'
                  : 'Create the first admin account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAdminExist && isSignUpSuccess ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Check your email to confirm your admin account.
                  </p>
                </div>
              ) : (
                <form onSubmit={isAdminExist ? handleLogin : handleSignUp}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <PasswordField
                      id="password"
                      autoComplete={isAdminExist ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? 'Loading...' : isAdminExist ? 'Login' : 'Sign up'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
