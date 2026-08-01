import { Skeleton } from "@ecommerce/ui/components/skeleton"

type ProfilePageSkeletonProps = {
  variant?: "cards" | "list" | "detail" | "form"
}

export function ProfilePageSkeleton({
  variant = "cards",
}: ProfilePageSkeletonProps) {
  if (variant === "form")
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-5 rounded-2xl border p-6 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )

  return (
    <div className="space-y-5" aria-busy="true">
      {" "}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      {Array.from({ length: variant === "detail" ? 2 : 3 }, (_, index) => (
        <div key={index} className="space-y-4 rounded-2xl border p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          {variant !== "list" ? (
            <div className="flex gap-3 border-t pt-4">
              <Skeleton className="size-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
