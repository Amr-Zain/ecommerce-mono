import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ecommerce/ui/components/card'
import { Separator } from '@ecommerce/ui/components/separator'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

export default function ProductShowSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex justify-end p-4">
        <Skeleton className="h-9 w-28" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Separator orientation="vertical" className="h-5" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="mt-2 h-4 w-80" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </CardHeader>
      </Card>

      {/* Pricing + Meta */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <Skeleton className="h-3 w-24" />
            <div className="mt-2 flex items-center gap-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-5 w-24" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-5 w-28" />
            <Skeleton className="mt-2 h-3 w-44" />
          </div>
        </CardContent>
      </Card>

      {/* Localized content (tabs) */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-44" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs bar */}
          <div className="mb-4 flex gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          {/* Tab content */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-56 w-full rounded" />
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-40 w-full rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variations */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-3 py-3"
              >
                <div className="col-span-6 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <CardFooter className="flex items-center justify-end">
        <Skeleton className="h-4 w-48" />
      </CardFooter>
    </div>
  )
}
