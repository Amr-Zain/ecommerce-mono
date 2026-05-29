import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <SmartBreadcrumbs />

            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden rounded-xl bg-muted/20 p-8 shadow-sm border border-muted/40 animate-pulse">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-64 md:w-96" />
                        <Skeleton className="h-5 w-48 md:w-80" />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-background/40 backdrop-blur-sm p-4 rounded-lg border border-border/10 w-40">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                        <div className="bg-background/40 backdrop-blur-sm p-4 rounded-lg border border-border/10 w-40">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-8 w-28" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs List Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-md flex-shrink-0" />
                ))}
            </div>

            {/* OVERVIEW TAB CONTENT SKELETON */}
            <div className="space-y-6 animate-pulse">
                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-20 mb-1" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {/* Recent Orders Skeleton */}
                    <Card className=" shadow-sm border-muted/60">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-transparent bg-muted/10">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-lg" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Users Skeleton */}
                    <div className="space-y-4">
                        <Card className="shadow-sm border-muted/60 h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                            <div className="flex-1 space-y-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {/* Recent Reviews Skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/10">
                                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                            <Skeleton className="h-3 w-full" />
                                            <div className="flex justify-between pt-1">
                                                <Skeleton className="h-5 w-20 rounded-full" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Products Skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/10">
                                        <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-4 w-40" />
                                                <Skeleton className="h-4 w-16" />
                                            </div>
                                            <div className="flex justify-between pt-1">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
