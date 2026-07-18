import Orders from '@/components/pagesComponents/Orders'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Order } from '@/types/api/order'
import type { Meta } from '@/types/api/http'
import { TableLoader } from '@/components/common/table/TableLoader'
import { Suspense } from 'react'
import {
  OrderStatusStats,
  OrderStatusStatsSkeleton,
} from '@/components/pagesComponents/Orders/OrderStatusStats'

import { hasPermission, routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/orders/')({
  beforeLoad: ({ context }) => {
    routePermission('orders', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    status: toStr(search.status),
    payment_status: toStr(search.payment_status),
  }),
  loaderDeps: ({ search }) => ({
    search: {
      ...searchParamsValidate(search),
      status: toStr(search.status),
      payment_status: toStr(search.payment_status),
    },
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext

    // Prefetch order data
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.orders.filterd(search),
        endpoint: 'orders?paginate=1',
        params: search,
      }),
    )

    // Prefetch dashboard stats for order cards
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.dashboard.section('sales'),
        endpoint: 'dashboard/sections/sales',
      }),
    )
  },
})

function OrdersTable() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<
    ApiResponseBase<{
      items: Order[]
      meta?: Meta
    }>
  >({
    queryKey: queryKeys.orders.filterd(search),
    endpoint: 'orders?paginate=1',
    suspense: true,
    params: search,
  })

  return <Orders data={data!} />
}

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.orders" />
      {hasPermission('dashboard-home', 'index') && (
        <Suspense fallback={<OrderStatusStatsSkeleton />}>
          <OrderStatusStats />
        </Suspense>
      )}
      <Suspense fallback={<TableLoader />}>
        <OrdersTable />
      </Suspense>
    </>
  )
}
