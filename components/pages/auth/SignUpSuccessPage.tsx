import Link from 'next/link';
import { routes } from '@/config';

export function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md text-center border rounded-lg p-8 bg-card text-card-foreground shadow">
        <h1 className="text-2xl font-bold mb-4">Registration Submitted</h1>
        <p className="text-muted-foreground mb-6">
          Your registration is awaiting admin approval. You will receive a confirmation email once
          approved.
        </p>
        <Link href={routes.login} className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
