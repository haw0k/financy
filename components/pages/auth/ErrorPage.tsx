import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn';
import { routes } from '@/config';
import { AUTH_MSGS } from '@/messages';

export async function ErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{AUTH_MSGS.ERROR_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {params.error
              ? `${AUTH_MSGS.ERROR_CODE_LABEL}: ${params.error}`
              : AUTH_MSGS.ERROR_UNSPECIFIED}
          </p>
          <Link href={routes.login} className="text-sm text-primary hover:underline">
            {AUTH_MSGS.ERROR_BACK_TO_LOGIN}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
