import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

export function SettingsGeneralSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-4 animate-pulse">
            <SmartBreadcrumbs entityKey="settings.general" />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation Skeleton */}
                <aside className="lg:w-64 shrink-0">
                    <div className="flex flex-col gap-1 w-full">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 h-11 rounded-md border border-transparent">
                                <Skeleton className="h-4 w-4 shrink-0" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content Skeleton */}
                <div className="flex-1">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {/* Card Header Skeleton */}
                        <div className="bg-muted/10 border-b p-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                        </div>

                        {/* Card Body Skeleton (Form fields) */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={i === 0 ? "col-span-full md:col-span-2" : "col-span-1"}>
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-10 w-full rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Save button skeleton */}
                            <div className="mt-10 flex justify-end">
                                <Skeleton className="h-10 w-32 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
