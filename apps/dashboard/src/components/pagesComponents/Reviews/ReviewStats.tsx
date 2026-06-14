import { useTranslation } from "react-i18next";
import { Star, Clock, AlertCircle } from "lucide-react";
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

export function ReviewStats() {
    const { t } = useTranslation();
    const { data: statsResponse } = useFetch<ApiResponseBase<DashboardStatistics>>({
        queryKey: queryKeys.dashboard.statistics(),
        endpoint: 'dashboard/home',
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
            <StatsCard title={t('dashboard.totalReviews')} value={data?.reviews?.total} icon={Star} iconColor="text-yellow-500 bg-yellow-500/10" />
            <StatsCard title={t('dashboard.averageRating')} value={data?.reviews?.average_rating} icon={Star} iconColor="text-orange-500 bg-orange-500/10" />
            <StatsCard title={t('dashboard.thisMonth')} value={data?.reviews?.this_month} icon={Clock} iconColor="text-blue-600 bg-blue-500/10" />
            <StatsCard title={t('dashboard.pendingApproval')} value={data?.reviews?.pending_approval} icon={AlertCircle} iconColor="text-amber-500 bg-amber-500/10" className="text-warning" />
        </motion.div>
    );
}

export function ReviewStatsSkeleton() {
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
