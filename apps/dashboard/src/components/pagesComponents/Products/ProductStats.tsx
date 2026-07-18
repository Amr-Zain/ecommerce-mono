import { useTranslation } from "react-i18next";
import { Package, XCircle, AlertCircle, CreditCard } from "lucide-react";
import { motion, Variants } from "motion/react";
import { StatsCard } from "@/components/common/charts/StatsCard";
import useFetch from "@/hooks/UseFetch";
import { queryKeys } from '@/util/queryKeysFactory'
;
import { ApiResponseBase } from "@/types/api/http";
import { DashboardStatistics } from "@/types/api/dashboard";
import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";
import { SARIcon } from "@/components/common/Icons";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function ProductStats() {
    const { t } = useTranslation();
    const { data: statsResponse } = useFetch<ApiResponseBase<DashboardStatistics>>({
        queryKey: queryKeys.dashboard.section('inventory'),
        endpoint: 'dashboard/sections/inventory',
        suspense: true,
    });

    const data = statsResponse?.data;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.08,
                    },
                },
            }}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
        >
            <StatsCard title={t('dashboard.totalProducts')} value={data?.products?.total} icon={Package} iconColor="text-indigo-600 bg-indigo-500/10" />
            <StatsCard title={t('dashboard.outOfStock')} value={data?.products?.out_of_stock} icon={XCircle} iconColor="text-red-500 bg-red-500/10" className="text-destructive" />
            <StatsCard title={t('dashboard.lowStock')} value={data?.products?.low_stock} icon={AlertCircle} iconColor="text-amber-500 bg-amber-500/10" className="text-warning" />
            <StatsCard title={t('dashboard.inventoryValue')} value={<div className="flex items-center gap-1">{data?.products?.inventory_value?.toLocaleString()} <SARIcon className="h-5 w-5 text-primary/60" /></div>} icon={CreditCard} iconColor="text-emerald-600 bg-emerald-500/10" />
        </motion.div>
    );
}

export function ProductStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
