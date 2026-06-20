import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { ReturnExchangeShow } from '@/components/pagesComponents/ReturnExchangeWorkflow'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ExchangeRequest } from '@/types/api/order'
import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/exchanges/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('exchanges', 'show')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.exchanges.getExchange(params.id),
        endpoint: `exchanges/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<ExchangeRequest>>({
    queryKey: queryKeys.exchanges.getExchange(id),
    endpoint: `exchanges/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.exchanges"
        entityTo="/exchanges"
        action="show"
      />
      <ReturnExchangeShow kind="exchange" request={data!.data} />
    </>
  )
}
