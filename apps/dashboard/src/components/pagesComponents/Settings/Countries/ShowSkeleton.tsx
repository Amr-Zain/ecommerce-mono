import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@ecommerce/ui/components/card'
import { Separator } from '@ecommerce/ui/components/separator'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

export function CountryShowSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Skeleton className="h-10 w-40 ms-auto" />
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-md ring-1 ring-border">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Separator orientation="vertical" className="h-5" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* General card skeleton */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">
                  <Skeleton className="h-5 w-24" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-52" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">
                  <Skeleton className="h-5 w-36" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </CardHeader>
              <CardContent className="my-4">
                <AnimatedTabs
                  defaultValue="en"
                  items={[
                    {
                      value: 'en',
                      label: 'English',
                      content: (
                        <div className="mt-4 space-y-6">
                          <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                              <div key={`en-${i}`} className="flex items-center gap-6">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-32" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    },
                    {
                      value: 'ar',
                      label: 'Arabic',
                      content: (
                        <div className="mt-4">
                          <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                              <div key={`ar-${i}`} className="flex items-center gap-6">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-32" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  tabsListClassName="grid w-full grid-cols-2"
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-40" />
        </CardFooter>
      </Card>
    </div>
  )
}
