import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from '@ecommerce/ui/components/card'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

export default function UserShowSkeleton() {
    return (
        <>
            <SmartBreadcrumbs
                entityKey="menu.users"
                entityTo="/users"
                action="show"
            />
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Header Skeleton */}
                <Card className="shadow-none">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                            <div className="flex items-center gap-4 w-full">
                                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                                <div className="space-y-2 w-full">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                                        <Skeleton className="h-8 w-48" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="shadow-none p-4 py-8">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                        </Card>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <Skeleton className="h-4 w-48 mt-1" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between py-2 border-b last:border-0 border-dashed">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48 mt-1" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between py-2 border-b last:border-0 border-dashed">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="p-3 border rounded-md bg-muted/10 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                            <div className="p-3 border rounded-md bg-muted/10 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="p-3 border rounded-md bg-muted/10 flex justify-between items-center">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="p-3 border rounded-md bg-muted/10 flex justify-between items-center">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <CardFooter className="flex items-center justify-end p-0">
                    <Skeleton className="h-4 w-48" />
                </CardFooter>
            </div>
        </>
    )
}
