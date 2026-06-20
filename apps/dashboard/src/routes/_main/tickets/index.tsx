import Tickets from '@/components/pagesComponents/Tickets'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { Ticket } from '@/types/api/ticket'
import { searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { routePermission } from '@/lib/utils'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_main/tickets/')({
  beforeLoad: ({ context }) => {
    routePermission('tickets', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[status]': toStr(search['filters[status]']),
  }),
  loaderDeps: ({ search }) => ({
    search: {
      ...searchParamsValidate(search),
      'filters[status]': toStr(search['filters[status]']),
    },
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.tickets' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.tickets.filterd(search),
        endpoint: 'tickets?paginate=1',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Ticket>>({
    queryKey: queryKeys.tickets.filterd(search),
    endpoint: 'tickets?paginate=1',
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.tickets" />
      <Tickets data={data!} />
    </>
  )
}
