'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle, Button } from '@/lib/shadcn';
import { cn } from '@/lib/utils';

interface IErrorStateProps {
  title?: string;
  description?: string;
  retry?: boolean;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again later.',
  retry = false,
  className,
}: IErrorStateProps) {
  const router = useRouter();

  return (
    <div className={cn('w-full', className)}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-4">
          <span>{description}</span>
          {retry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                router.refresh();
              }}
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
