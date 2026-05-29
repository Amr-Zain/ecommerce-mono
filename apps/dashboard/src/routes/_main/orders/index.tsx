import Orders from '@/components/pagesComponents/Orders'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { dashboardQueryKeys, ordersQueryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Order } from '@/types/api/order'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import { OrderStatusStats, OrderStatusStatsSkeleton } from '@/components/pagesComponents/Orders/OrderStatusStats'

import { hasPermission, routePermission } from '@/lib/utils'

const endpoint = 'orders?paginate=1'

export const Route = createFileRoute('/_main/orders/')({
  beforeLoad: ({ context }) => {
    routePermission('orders', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[status]': toStr(search['filters[status]']),
    'filters[financial_status]': toStr(search['filters[financial_status]']),
    'filters[fulfillment_status]': toStr(search['filters[fulfillment_status]']),
  }),
  loaderDeps: ({ search }) => ({
    search: {
      ...searchParamsValidate(search),
      'filters[status]': toStr(search['filters[status]']),
      'filters[financial_status]': toStr(search['filters[financial_status]']),
      'filters[fulfillment_status]': toStr(search['filters[fulfillment_status]']),
    }
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext

    // Prefetch order data
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: ordersQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )

    // Prefetch dashboard stats for order cards
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: dashboardQueryKeys.statistics(),
        endpoint: 'dashboard/home'
      })
    )
  },
})

function OrdersTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<
    ApiResponse<{
      orders: Order[],
      meta: any
    }, 'orders'>
  >({
    queryKey: ordersQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })

  return <Orders data={data!} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.orders" />
      {hasPermission('dashboard-home', 'index') && <Suspense fallback={<OrderStatusStatsSkeleton />}>
        <OrderStatusStats />
      </Suspense>}
      <Suspense fallback={<TableLoader />}>
        <OrdersTable />
      </Suspense>
    </>
  )
}
