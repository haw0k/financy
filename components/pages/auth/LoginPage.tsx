'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Input, Label } from '@/lib/shadcn';
import { PasswordField } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Image src="/icon.svg" alt="Financy" width={48} height={48} />
            <h1 className="text-2xl font-bold">Financy</h1>
          </div>
          <div className="border rounded-lg p-8 bg-card text-card-foreground shadow">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}
