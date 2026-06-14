import Reviews, { ReviewEntity } from '@/components/pagesComponents/Reviews'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { ReviewStats, ReviewStatsSkeleton } from '@/components/pagesComponents/Reviews/ReviewStats'

import { hasPermission, routePermission } from '@/lib/utils'

const endpoint = 'reviews?paginate=1'

export const Route = createFileRoute('/_main/reviews/')({
    beforeLoad: ({ context }) => {
        routePermission('reviews', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
        'filters[userId]': toStr(search['filters[userId]']),
        'filters[productId]': toStr(search['filters[productId]']),
        'filters[rating]': toStr(search['filters[rating]']),
    }),
    loaderDeps: ({ search }) => ({
        search: {
            ...searchParamsValidate(search),
            'filters[userId]': toStr(search['filters[userId]']),
            'filters[productId]': toStr(search['filters[productId]']),
            'filters[rating]': toStr(search['filters[rating]']),
        }
    }),
    loader: ({ context, deps: { search } }) => {
        const { queryClient } = context as RouterContext

        // Prefetch review data
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.reviews.filterd(search),
                endpoint,
                params: search,
            }),
        )

        // Prefetch dashboard stats for review cards
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: queryKeys.dashboard.statistics(),
                endpoint: 'dashboard/home'
            })
        )
    },
})

function ReviewsTable() {
    const search = Route.useLoaderDeps().search
    const { data } = useFetch<ApiResponse<ReviewEntity>>({
        queryKey: queryKeys.reviews.filterd(search),
        endpoint,
        suspense: true,
        params: search,
    })

    return <Reviews data={data! as any} />
}

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.reviews" />
            {hasPermission('dashboard-home', 'index') && <Suspense fallback={<ReviewStatsSkeleton />}>
                <ReviewStats />
            </Suspense>}
            <Suspense fallback={<TableLoader />}>
                <ReviewsTable />
            </Suspense>
        </>
    )
}
