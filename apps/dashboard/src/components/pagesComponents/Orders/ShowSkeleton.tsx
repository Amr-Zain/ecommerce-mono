import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';
import { Separator } from "@ecommerce/ui/components/separator";

export default function OrderShowSkeleton() {
    return (
        <div className="space-y-6">
            <SmartBreadcrumbs
                entityKey="menu.orders"
                entityTo="/orders"
                action="show"
            />
            <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-10" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-8 w-28 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-5" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-0 p-0">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i}>
                                        <div className="flex items-start gap-4 px-6 py-4">
                                            <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-[60%]" />
                                                <Skeleton className="h-3 w-[30%]" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-12" />
                                                </div>

                                                {/* Properties placeholder */}
                                                <div className="space-y-1 mt-2">
                                                    <Skeleton className="h-2.5 w-24" />
                                                    <Skeleton className="h-2.5 w-32" />
                                                </div>

                                                {/* Gift card/Attribute placeholder */}
                                                <div className="mt-3 p-2 bg-muted/20 rounded-lg space-y-2">
                                                    <Skeleton className="h-2 w-16" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-end">
                                                <Skeleton className="h-5 w-20 ms-auto" />
                                                <Skeleton className="h-3 w-12 ms-auto" />
                                            </div>
                                        </div>
                                        {i < 1 && <Separator className="opacity-50" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Fulfillment Tracking Summary Skeleton */}
                        <Card className="shadow-sm border-primary/20  overflow-hidden border-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="ms-auto h-5 w-16 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-background/80 p-4 rounded-2xl border border-primary/10 flex justify-between items-center">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-6 w-40" />
                                    </div>
                                    <Skeleton className="h-11 w-32 rounded-xl" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipments / Fulfillments Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="ms-auto h-5 w-8 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="px-6 py-6 space-y-6">
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="h-12 w-12 rounded-2xl" />
                                            <div className="space-y-1.5">
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-12 rounded" />
                                                </div>
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-9 w-28 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Skeleton className="h-32 w-full rounded-2xl" />
                                        <Skeleton className="h-32 w-full rounded-2xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Price Summary Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-8 w-28" />
                                </div>
                                <div className="bg-primary/5 p-3 rounded-lg flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payments Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-2 pt-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-5 w-6 rounded-full ms-auto" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="px-6 py-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-16 rounded" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-end">
                                            <Skeleton className="h-6 w-24 ms-auto" />
                                            <Skeleton className="h-3 w-20 ms-auto" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-20 w-full rounded-2xl" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Notes & Additional Details Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3 space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <div className="ps-4 space-y-4 border-l border-muted/30">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-14 w-14 rounded-2xl" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <Skeleton className="h-4 w-20" />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-2.5 w-16" />
                                            <Skeleton className="h-3.5 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Link Skeleton */}
                        <Card className="shadow-sm border-primary/20 bg-primary/5">
                            <CardContent className="p-4">
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </CardContent>
                        </Card>

                        {/* Tech Info Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2 border-b border-muted/40">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Skeleton className="h-7 w-7 rounded flex-shrink-0" />
                                        <div className="space-y-1.5 flex-1">
                                            <Skeleton className="h-2 w-12" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
