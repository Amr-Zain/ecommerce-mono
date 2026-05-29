import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { ordersQueryKeys } from '@/util/queryKeysFactory'
import { OrderDetail } from '@/types/api/order'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import OrderShow from '@/components/pagesComponents/Orders/Show'
import OrderShowSkeleton from '@/components/pagesComponents/Orders/ShowSkeleton'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/orders/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('orders', 'show')
    return context
  },
  component: RouteComponent,
  pendingComponent: OrderShowSkeleton,
  loader: async ({ params, context }) => {
    const { queryClient } = context as RouterContext
    const endpoint = `orders/${params.id}`
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: ordersQueryKeys.getOrder(params.id),
        endpoint: endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<OrderDetail>>({
    queryKey: ordersQueryKeys.getOrder(id),
    endpoint: `orders/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.orders"
        entityTo="/orders"
        action="show"
      />
      <OrderShow order={data?.data as OrderDetail} />
    </>
  )
}
