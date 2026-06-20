import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Reward } from '@/types/api/earningRules'
import Rewards from '@/components/pagesComponents/rewards'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { RewardStats, RewardStatsSkeleton } from '@/components/pagesComponents/rewards/RewardStats'

import { hasPermission, routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/rewards/')({
    beforeLoad: ({ context }) => {
        routePermission('rewards', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
        "filters[reward_type]": toStr(search['filters[reward_type]']),
    }),
    loaderDeps: ({ search }) => ({
        search: {
            ...searchParamsValidate(search),
            "filters[reward_type]": toStr(search['filters[reward_type]']),
        },
    }),
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext

        // Prefetch rewards data
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.rewards.filtered(search),
                endpoint: 'rewards?paginate=1',
                params: search,
            }),
        )

        // Prefetch dashboard stats for cards
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.dashboard.statistics(),
                endpoint: 'dashboard/home'
            })
        )
    },
})

function RewardsContent() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<ApiResponse<Reward[], 'rewards'>>({
        queryKey: queryKeys.rewards.filtered(search),
        endpoint: 'rewards?paginate=1',
        suspense: true,
        params: search,
    })

    return <Rewards data={data!} />
}

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.rewards" />
            {hasPermission('dashboard-home', 'index') && <Suspense fallback={<RewardStatsSkeleton />}>
                <RewardStats />
            </Suspense>}
            <Suspense fallback={<TableLoader />}>
                <RewardsContent />
            </Suspense>
        </>
    )
}
