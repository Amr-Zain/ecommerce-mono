import { Card, CardHeader, CardContent } from '@ecommerce/ui/components/card'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { Separator } from '@ecommerce/ui/components/separator'

export function CategoryShowSkeleton() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-8 rounded" />
                            <Skeleton className="h-7 w-36" />
                            <Skeleton className="h-5 w-24 opacity-60" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content — left 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Localized Content Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-5 w-36" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Tab triggers */}
                            <div className="flex gap-2">
                                <Skeleton className="h-9 flex-1 rounded-md" />
                                <Skeleton className="h-9 flex-1 rounded-md" />
                            </div>
                            {/* Content rows */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sub-Collections Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-6 rounded-full ms-auto" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                                        <Skeleton className="h-11 w-11 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-24" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-3.5 w-14 rounded-full" />
                                                <Skeleton className="h-3.5 w-8" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar — right col */}
                <div className="space-y-6">
                    {/* General Info */}
                    <Card className="shadow-sm border-muted/60">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <Skeleton className="h-3 w-20" />
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card className="shadow-sm border-muted/60">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <Skeleton className="h-3 w-16" />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-10 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Category */}
                    <Card className="shadow-sm border-muted/60">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <Skeleton className="h-3 w-28" />
                        </CardHeader>
                        <CardContent className="pt-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
