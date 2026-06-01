import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { Card, CardContent, CardHeader } from '@ecommerce/ui/components/card'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { ComponentProps } from 'react'

interface TableLoaderProps {
  rowCount?: number
  colCount?: number
  showToolbar?: boolean
  showPagination?: boolean
  breadcrumbs?: ComponentProps<typeof SmartBreadcrumbs>
}

export function TableLoader({
  rowCount = 10,
  colCount = 1,
  showToolbar = true,
  showPagination = true,
  breadcrumbs,
}: TableLoaderProps) {
  return (
    <div className="space-y-4 p-0 w-full">
      {breadcrumbs && <SmartBreadcrumbs {...breadcrumbs} />}
      {showToolbar && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      )}

      <Card className="rounded-md border p-1 bg-secondary/15">
        <CardHeader className="p-4">
          <div className="flex items-center space-x-4">
            {Array.from({ length: colCount }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-8 w-full" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            {Array.from({ length: rowCount }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                {Array.from({ length: colCount }).map((_, j) => (
                  <Skeleton key={`cell-${i}-${j}`} className="h-12 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showPagination && (
        <div className="flex items-center justify-end">
          <div className="flex gap-2 px-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  )
}
