import { Skeleton } from '@/lib/shadcn';

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
