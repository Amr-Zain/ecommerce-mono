import * as React from 'react'
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

export function PageHeaderCardSkeleton() {
  return (
    <>
      <div className="flex justify-end p-4">
        <Skeleton className="h-9 w-40" /> {/* Edit button */}
      </div>
      <Card>

        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-44" />
                <Separator orientation="vertical" className="h-5" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-20 rounded-full" /> {/* status pill */}
            <Skeleton className="h-4 w-28" />
          </div>
        </CardHeader>
      </Card>
    </>
  )
}

/* ------------------------- Localized Content Skeleton ------------------------- */

export function LocalizedContentCardSkeleton() {
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
        {/* Tabs header */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        {/* Tab body */}
        <div className="space-y-4">
          {/* Title row */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Content row */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Additionals Skeleton ---------------------------- */

export function AdditionalsCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              <Skeleton className="h-5 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-2 h-4 w-64" />
            </CardDescription>
          </div>

          <Button disabled>
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="divide-y min-w-200">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid items-center gap-3 py-3 grid-cols-11">
              {/* image */}
              <div className="col-span-2 flex items-center gap-2">
                <Skeleton className="h-14 w-14 rounded" />
              </div>

              {/* title */}
              <div className="col-span-5">
                <Skeleton className="h-5 w-3/4" />
              </div>

              {/* status badge */}
              <div className="col-span-1 place-self-center">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* created at */}
              <div className="col-span-2">
                <Skeleton className="h-4 w-24" />
              </div>

              {/* row actions */}
              <div className="col-span-1 place-self-end">
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

export function PageFooterSkeleton() {
  return (
    <CardFooter className="flex items-center justify-end text-sm text-muted-foreground">
      <Skeleton className="h-4 w-44" />
    </CardFooter>
  )
}

/* ------------------------------- Dialog Skeletons ------------------------------ */

// View dialog skeleton
export function AdditionalViewDialogSkeleton() {
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
        <Skeleton className="h-20 w-20 rounded" />
      </div>

      {/* Localized tabs mimic */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

// Form dialog skeleton
export function AdditionalFormDialogSkeleton() {
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
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

/* --------------------------- Page-level Composition --------------------------- */

export function StaticPageShowSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeaderCardSkeleton />
      <LocalizedContentCardSkeleton />
      <AdditionalsCardSkeleton />
      <PageFooterSkeleton />
    </div>
  )
}
