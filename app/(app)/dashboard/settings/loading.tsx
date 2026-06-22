import { Skeleton } from '@/lib/shadcn';

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-24 mb-4" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="space-y-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-56" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-24 mb-4" />
          <div className="space-y-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
