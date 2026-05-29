import { Card, CardContent, CardHeader } from '@ecommerce/ui/components/card'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

export const RoleShowSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* Main Info Card Skeleton */}
            <Card className="rounded-xl border border-border pt-0">
                <CardHeader className="bg-muted/30 border-b border-border p-4">
                    <Skeleton className="h-6 w-3/12" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4 mt-4 flex items-center gap-6">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Grid Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-7 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="rounded-xl border border-border shadow-sm overflow-hidden pt-0">
                            <CardHeader className="p-2 bg-muted/20 border-b border-border">
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-6 w-20 rounded-md" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
