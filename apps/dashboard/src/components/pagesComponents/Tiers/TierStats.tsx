import { useTranslation } from "react-i18next";
import { Gift, Users } from "lucide-react";
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

export function TierStats() {
    const { t } = useTranslation();
    const { data: statsResponse } = useFetch<ApiResponseBase<DashboardStatistics>>({
        queryKey: dashboardQueryKeys.statistics(),
        endpoint: 'dashboard/home',
        suspense: true,
    });

    const data = statsResponse?.data;
    const tiers = data?.loyalty?.users_by_tier || [];
    const totalUsers = data?.users?.total || 1;

    const colors = [
        "text-primary bg-primary/10",
        "text-emerald-600 bg-emerald-500/10",
        "text-violet-600 bg-violet-500/10",
        "text-amber-500 bg-amber-500/10",
        "text-blue-600 bg-blue-500/10",
    ];

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
            {tiers.map((tier, idx) => (
                <StatsCard
                    key={tier.tier_name}
                    title={tier.tier_name}
                    value={tier.count}
                    change={`${((tier.count / totalUsers) * 100).toFixed(1)}%`}
                    changeType="increase"
                    icon={Gift}
                    iconColor={colors[idx % colors.length]}
                />
            ))}
        </motion.div>
    );
}

export function TierStatsSkeleton() {
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
