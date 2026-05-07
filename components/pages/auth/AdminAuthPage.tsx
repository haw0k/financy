'use client';

import { useState, useEffect, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
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
import { PasswordField } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { routes, getSupabaseRedirectUrl, siteConfig } from '@/config';
import { ERole } from '@/enums';
import { handleSupabaseError } from '@/lib/handle-supabase-error';

export function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminExist, setAdminExists] = useState<boolean | null>(null);
  const [isSignUpSuccess, setSignUpSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check-admin')
      .then((res) => res.json())
      .then((data) => setAdminExists(data.exists))
      .catch(() => setAdminExists(true));
  }, []);

  const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            getSupabaseRedirectUrl() ?? `${window.location.origin}${routes.authCallback}`,
          data: { role: ERole.Admin },
        },
      });

      if (signUpError) throw signUpError;
      setSignUpSuccess(true);
    } catch (err: unknown) {
      handleSupabaseError(err, 'Admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      router.push(routes.admin);
    } catch (err: unknown) {
      handleSupabaseError(err, 'Admin');
    } finally {
      setIsLoading(false);
    }
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Loading...' : isAdminExist ? 'Login' : 'Sign up'}
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
