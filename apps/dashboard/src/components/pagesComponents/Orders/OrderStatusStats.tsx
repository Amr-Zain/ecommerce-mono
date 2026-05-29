import { useTranslation } from "react-i18next";
import { Clock, CheckCircle2, XCircle, AlertCircle, ShoppingCart, LucideIcon } from "lucide-react";
import { motion, Variants } from "motion/react";
import { StatsCard } from "@/components/common/charts/StatsCard";
import useFetch from "@/hooks/UseFetch";
import { dashboardQueryKeys } from "@/util/queryKeysFactory";
import { ApiResponseBase } from "@/types/api/http";
import { DashboardStatistics } from "@/types/api/dashboard";
import { Card, CardContent, CardHeader } from "@ecommerce/ui/components/card";
import { Skeleton } from "@ecommerce/ui/components/skeleton";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const statusConfig: Record<string, { icon: LucideIcon; color: string }> = {
    open: { icon: Clock, color: "text-blue-600 bg-blue-500/10" },
    cancelled: { icon: XCircle, color: "text-red-500 bg-red-500/10" },
    closed: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
    pending: { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
};

export function OrderStatusStats() {
    const { t } = useTranslation();
    const { data: statsResponse } = useFetch<ApiResponseBase<DashboardStatistics>>({
        queryKey: dashboardQueryKeys.statistics(),
        endpoint: 'dashboard/home',
        suspense: true,
    });

    const data = statsResponse?.data;
    const statuses = Object.entries(data?.orders?.by_status || {})
        .filter(([name]) => name && name !== 'null' && name !== 'undefined');

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
            {/* Total Orders Summary Card */}
            <StatsCard
                title={t('dashboard.totalOrders')}
                value={data?.orders?.total}
                change={`+${data?.orders?.orders_this_month} ${t('dashboard.thisMonth')}`}
                changeType="increase"
                icon={ShoppingCart}
                iconColor="text-indigo-600 bg-indigo-500/10"
            />

            {/* Breakdown by Status */}
            {statuses.map(([name, count]) => {
                const config = statusConfig[name] || { icon: ShoppingCart, color: "text-primary bg-primary/10" };
                return (
                    <StatsCard
                        key={name}
                        title={t(`status.${name}`)}
                        value={count}
                        icon={config.icon}
                        iconColor={config.color}
                    />
                );
            })}
        </motion.div>
    );
}

export function OrderStatusStatsSkeleton() {
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
