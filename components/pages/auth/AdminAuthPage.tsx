'use client';

import { type SubmitEvent, useEffect, useState, useTransition } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
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
import { PasswordField, showError } from '@/components/ui';
import { withTimeout } from '@/lib/with-timeout';
import { siteConfig } from '@/config';
import { adminLoginAction, adminSignUpAction } from '@/app/actions/auth';
import { AUTH_MSGS } from '@/messages';

export function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAdminExist, setIsAdminExist] = useState<boolean | null>(null);
  const [isCheckError, setIsCheckError] = useState(false);
  const [isSignUpSuccess, setSignUpSuccess] = useState(false);

  const checkAdmin = () => {
    setIsCheckError(false);
    setIsAdminExist(null);

    fetch('/api/auth/check-admin')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIsAdminExist(data.exists);
      })
      .catch(() => {
        setIsCheckError(true);
      });
  };

  useEffect(() => {
    // Defer the fetch so the state update does not happen synchronously inside the effect body.
    const timer = setTimeout(() => {
      checkAdmin();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
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
      } catch (error) {
        if (isRedirectError(error)) throw error;
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
      } catch (error) {
        if (isRedirectError(error)) throw error;
        showError('Admin', AUTH_MSGS.TIMEOUT);
      }
    });
  };

  if (isCheckError) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">
            Failed to check admin status. Please check your connection and try again.
          </p>
          <Button onClick={checkAdmin}>Retry</Button>
        </div>
      </div>
    );
  }

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
            <Image src="/logo.svg" alt={siteConfig.name} width={48} height={48} loading="eager" />
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
