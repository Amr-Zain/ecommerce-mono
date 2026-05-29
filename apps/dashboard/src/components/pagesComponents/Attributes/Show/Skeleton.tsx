import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ecommerce/ui/components/card'
import { Separator } from '@ecommerce/ui/components/separator'
import { Button } from '@ecommerce/ui/components/button'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

/* ----------------------------- Header Skeleton ---------------------------- */

export function AttributeHeaderSkeleton() {
  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Separator orientation="vertical" className="h-5" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="mt-1">
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" /> {/* status */}
          <Button disabled className="pointer-events-none">
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ----------------------------- General Card ------------------------------ */

export function AttributeGeneralSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">
          <Skeleton className="h-5 w-28" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="mt-2 h-4 w-64" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 text-sm">
          {[0, 1, 2].map((i) => (
            <div className="flex gap-4" key={i}>
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------- Localized Content Skeleton ------------------------- */

export function AttributeLocalizedSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">
          <Skeleton className="h-5 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="mt-2 h-4 w-64" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        {/* Tab body */}
        <div className="space-y-4">
          {/* Name row */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Values List Skeleton ---------------------------- */

export function AttributeValuesSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              <Skeleton className="h-5 w-24" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-2 h-4 w-72" />
            </CardDescription>
          </div>
          <Button disabled className="pointer-events-none">
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 items-center gap-3 py-3 sm:grid-cols-10"
            >
              <div className="sm:col-span-3">
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="sm:col-span-2">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="sm:col-span-2">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="sm:col-span-2">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="sm:col-span-1 place-self-end">
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------- Footer Skeleton ------------------------------- */

export function AttributeFooterSkeleton() {
  return (
    <CardFooter className="flex items-center justify-end text-sm text-muted-foreground">
      <Skeleton className="h-4 w-44" />
    </CardFooter>
  )
}

/* ------------------------------- Dialog Skeletons ------------------------------ */

export function AttributeEditDialogSkeleton() {
  return (
    <div className="max-w-2xl max-h-[70vh] overflow-y-auto space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

export function AttributeValueViewDialogSkeleton() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      {/* localized mimic */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function AttributeValueFormDialogSkeleton() {
  return (
    <div className="max-w-2xl max-h-[70vh] overflow-y-auto space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

/* --------------------------- Page-level Composition --------------------------- */

export function AttributeShowSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AttributeHeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-2">
        <AttributeGeneralSkeleton />
        <AttributeLocalizedSkeleton />
      </div>
      <AttributeValuesSkeleton />
      <AttributeFooterSkeleton />
    </div>
  )
}
