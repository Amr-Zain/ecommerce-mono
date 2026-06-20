import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { ReturnExchangeShow } from '@/components/pagesComponents/ReturnExchangeWorkflow'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { ReturnRequest } from '@/types/api/order'
import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/returns/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('returns', 'show')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.returns.getReturn(params.id),
        endpoint: `returns/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<ReturnRequest>>({
    queryKey: queryKeys.returns.getReturn(id),
    endpoint: `returns/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.returns"
        entityTo="/returns"
        action="show"
      />
      <ReturnExchangeShow kind="return" request={data!.data} />
    </>
  )
}
