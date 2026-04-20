import Link from 'next/link';

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md text-center border rounded-lg p-8 bg-white shadow">
        <div className="mb-4 text-5xl">📧</div>
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We sent you a confirmation link. Please check your email and click the link to verify your
          account.
        </p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}