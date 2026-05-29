import { Skeleton } from '@ecommerce/ui/components/skeleton'

export const RoleFormSkeleton = () => {
    return (
        <div className="space-y-6 bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-border overflow-hidden">
                            <div className="pb-3 pt-4 px-4 flex flex-row items-center justify-between">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </div>
                            <div className="px-4 pb-4 pt-0 space-y-3">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="flex justify-between items-center">
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-4 w-4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
        </div>
    )
}
