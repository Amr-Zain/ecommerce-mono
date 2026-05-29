import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { Separator } from "@ecommerce/ui/components/separator";

export default function PaymentSessionShowSkeleton() {
    return (
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-7 w-44 rounded-full" />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Info Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Provider Response Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 py-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-5 w-28" />
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 py-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 pb-0">
                        <CardHeader className="bg-muted/30 py-2 pb-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </CardHeader>
                        <CardContent className="py-4 flex flex-col items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="text-center space-y-1.5">
                                <Skeleton className="h-5 w-32 mx-auto" />
                                <Skeleton className="h-4 w-40 mx-auto" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Provider Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 pb-0">
                        <CardHeader className="bg-muted/30 py-2 pb-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardHeader>
                        <CardContent className="py-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 pb-0">
                        <CardHeader className="bg-muted/30 py-2 pb-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardHeader>
                        <CardContent className="py-4 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1 flex-1">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* SDK Params Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 pb-0">
                        <CardHeader className="bg-muted/30 py-2 pb-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </CardHeader>
                        <CardContent className="py-4 space-y-2.5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-0.5">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-7 w-full rounded" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Checkout URL Skeleton */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 py-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-5 w-28" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 p-3 rounded-lg border">
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
