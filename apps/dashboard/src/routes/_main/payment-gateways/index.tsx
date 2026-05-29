import PaymentGateways from '@/components/pagesComponents/PaymentGateways'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { dashboardQueryKeys, paymentGatewaysQueryKeys } from '@/util/queryKeysFactory'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { PaymentGatewayEntity } from '@/components/pagesComponents/PaymentGateways/Config'
import { Suspense } from 'react'
import { PaymentGatewayStats, PaymentGatewayStatsSkeleton } from '@/components/pagesComponents/PaymentGateways/PaymentGatewayStats'

const endpoint = 'payment-gateways'

import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { hasPermission, routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/payment-gateways/')({
    beforeLoad: ({ context }) => {
        routePermission('payment-gateways', 'index')
        return context
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        ...searchParamsValidate(search),
        'filters[provider]': toStr(search['filters[provider]']),
        'filters[order_id]': toStr(search['filters[order_id]']),
        'filters[user_id]': toStr(search['filters[user_id]']),
        'filters[status]': toStr(search['filters[status]']),
        'filters[completed_at]': toStr(search['filters[completed_at]']),
        tab: toStr(search.tab)
    }),
    loaderDeps: ({ search }) => ({
        search: cleanObject({
            ...searchParamsValidate(search),
            'filters[provider]': toStr(search['filters[provider]']),
            'filters[order_id]': toStr(search['filters[order_id]']),
            'filters[user_id]': toStr(search['filters[user_id]']),
            'filters[status]': toStr(search['filters[status]']),
            'filters[completed_at]': toStr(search['filters[completed_at]']),
            tab: toStr(search.tab)
        })
    }),
    loader: ({ context }) => {
        const { queryClient } = context as RouterContext

        // Prefetch payment gateways data
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: paymentGatewaysQueryKeys.all(),
                endpoint,
            }),
        )

        // Prefetch dashboard stats for cards
        queryClient.ensureQueryData(
            prefetchOptions({
                queryKey: dashboardQueryKeys.statistics(),
                endpoint: 'dashboard/home'
            })
        )
    },
})

function PaymentGatewaysContent() {
    return <PaymentGateways />
}

function RouteComponent() {
    return (
        <>
            <SmartBreadcrumbs entityKey="menu.paymentGateways" />
            {hasPermission('dashboard-home', 'index') && <Suspense fallback={<PaymentGatewayStatsSkeleton />}>
                <PaymentGatewayStats />
            </Suspense>}
            <Suspense fallback={<TableLoader />}>
                <PaymentGatewaysContent />
            </Suspense>
        </>
    )
}
