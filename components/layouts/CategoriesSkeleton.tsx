'use client';

import { Card, CardContent, CardHeader, Skeleton } from '@/lib/shadcn';
import type { FC } from 'react';

export const CategoriesSkeleton: FC = () => (
  <div className="flex flex-col gap-6 p-6 md:p-8">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  </div>
);
