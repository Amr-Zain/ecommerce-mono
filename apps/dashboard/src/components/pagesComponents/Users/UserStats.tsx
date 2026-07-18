import { useTranslation } from "react-i18next";
import { Users, CheckCircle2, UserX, PlusCircle, TrendingUp } from "lucide-react";
import { motion, Variants } from "motion/react";
import { StatsCard } from "@/components/common/charts/StatsCard";
import useFetch from "@/hooks/UseFetch";
import { queryKeys } from '@/util/queryKeysFactory'
;
import { ApiResponseBase } from "@/types/api/http";
import { DashboardStatistics } from "@/types/api/dashboard";
import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function UserStats() {
    const { t } = useTranslation();
    const { data: statsResponse } = useFetch<ApiResponseBase<DashboardStatistics>>({
        queryKey: queryKeys.dashboard.section('customers'),
        endpoint: 'dashboard/sections/customers',
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
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6"
        >
            <StatsCard title={t('dashboard.totalUsers')} value={data?.users?.total} icon={Users} iconColor="text-violet-600 bg-violet-500/10" />
            <StatsCard title={t('dashboard.activeUsers')} value={data?.users?.active} icon={CheckCircle2} iconColor="text-emerald-600 bg-emerald-500/10" />
            <StatsCard title={t('dashboard.bannedUsers')} value={data?.users?.banned} icon={UserX} iconColor="text-red-500 bg-red-500/10" className="text-destructive" />
            <StatsCard title={t('dashboard.newToday')} value={data?.users?.new_today} icon={PlusCircle} iconColor="text-blue-600 bg-blue-500/10" />
            <StatsCard title={t('dashboard.newThisMonth')} value={data?.users?.new_this_month} icon={TrendingUp} iconColor="text-orange-500 bg-orange-500/10" />
        </motion.div>
    );
}

export function UserStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            {[...Array(5)].map((_, i) => (
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
