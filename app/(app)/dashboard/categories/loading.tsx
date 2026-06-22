import { Skeleton } from '@/lib/shadcn';

export default function CategoriesLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Categories Table Skeleton */}
      <div className="rounded-lg border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Types Table Skeleton */}
      <div className="rounded-lg border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-40" />
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
