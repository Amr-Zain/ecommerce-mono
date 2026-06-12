import { Skeleton } from "@ecommerce/ui/components/skeleton"

function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="space-y-6 rounded-xl border p-5">
          <Skeleton className="h-7 w-20" />
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="space-y-3 border-b pb-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border">
              <Skeleton className="aspect-square rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { CatalogSkeleton }
