'use client';

import { useState, useTransition, type SubmitEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/lib/shadcn';
import { showError, PasswordField } from '@/components/ui';
import { routes, siteConfig } from '@/config';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { loginAction } from '@/app/actions/auth';
import { AUTH_MSGS } from '@/messages';
import { withTimeout } from '@/lib/with-timeout';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await withTimeout(loginAction({ email, password }));
        if (!result.isSuccess && result.error) {
          showError('Login', result.error);
        }
      } catch (error) {
        if (isRedirectError(error)) throw error;
        showError('Login', AUTH_MSGS.TIMEOUT);
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Image src="/icon.svg" alt={siteConfig.name} width={48} height={48} loading="eager" />
            <h1 className="text-2xl font-bold" style={{ color: siteConfig.accentColor }}>
              {siteConfig.name}
            </h1>
          </div>
          <Card className="border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="mt-1"
                  />
                </div>
                <PasswordField
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <Button type="submit" className="mt-4 w-full" disabled={isPending}>
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              <p className="text-center text-sm mt-4 text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href={routes.signUp} className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
