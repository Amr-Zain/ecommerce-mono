import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ecommerce/ui/components/table";
import { Separator } from "@ecommerce/ui/components/separator";

import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';

export default function ShopifyStoreShowSkeleton() {
    return (
        <div className="space-y-6">
            <SmartBreadcrumbs
                entityKey="menu.shopifyStores"
                entityTo="/settings/shopify-stores"
                action="show"
            />
            <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-9 w-64" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Settings Card Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-2 pt-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableBody>
                                        {[...Array(5)].map((_, i) => (
                                            <TableRow key={i} className="hover:bg-transparent border-none">
                                                <TableCell className="w-48 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <Skeleton className="h-4 w-full max-w-[200px]" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Webhooks Card Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-2 pt-4">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-8 rounded-md ms-auto" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow>
                                            <TableHead className="px-6 h-10"><Skeleton className="h-3 w-16" /></TableHead>
                                            <TableHead className="h-10"><Skeleton className="h-3 w-32" /></TableHead>
                                            <TableHead className="text-right px-6 h-10"><Skeleton className="h-3 w-16 ms-auto" /></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                                                <TableCell className="py-4"><Skeleton className="h-3 w-48" /></TableCell>
                                                <TableCell className="text-right px-6 py-4"><Skeleton className="h-5 w-16 rounded-full ms-auto" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* General Info Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-3 border-b border-muted/40 bg-muted/5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3.5 w-3.5" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-5">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-8 w-full rounded-lg" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Timeline Skeleton */}
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-3 border-b border-muted/40 bg-muted/5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3.5 w-3.5" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-5">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-2.5 w-20" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        {i < 3 && <Separator className="mt-4 opacity-30" />}
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
