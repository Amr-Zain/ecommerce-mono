import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';

export default function ReviewShowSkeleton() {
    return (
        <div className="space-y-6">
            <SmartBreadcrumbs
                entityKey="menu.reviews"
                entityTo="/reviews"
                action="show"
            />
            <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Review Content & Details Skeleton */}
                    <Card className="md:col-span-2 shadow-sm border-muted/60 overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-6 w-6" />
                                    ))}
                                </div>
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>

                            <div className="p-6 rounded-2xl border border-muted/20 space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-[90%]" />
                                <Skeleton className="h-5 w-[40%]" />
                            </div>

                            <div className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {[...Array(2)].map((_, i) => (
                                        <Skeleton key={i} className="aspect-square rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Relations Column Skeleton */}
                    <div className="space-y-6">
                        {/* User Info Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="pt-6 flex flex-col items-center gap-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <div className="space-y-2 items-center flex flex-col">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Info Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="pt-6 flex flex-col items-center gap-4">
                                <Skeleton className="h-32 w-full rounded-2xl" />
                                <div className="space-y-2 items-center flex flex-col w-full">
                                    <Skeleton className="h-5 w-[80%]" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
