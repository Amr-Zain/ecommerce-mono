import Exchanges from '@/components/pagesComponents/Exchanges'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { ApiResponseBase, Meta } from '@/types/api/http'
import { ExchangeRequest } from '@/types/api/order'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

const endpoint = 'exchanges'

export const Route = createFileRoute('/_main/exchanges/')({
  beforeLoad: ({ context }) => {
    routePermission('exchanges', 'index')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.exchanges' }} />
  ),
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    status: toStr(search.status),
  }),
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      status: toStr(search.status),
    }),
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.exchanges.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponseBase<{ items: ExchangeRequest[]; meta?: Meta }>>({
    queryKey: queryKeys.exchanges.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.exchanges" />
      <Exchanges data={data!} />
    </>
  )
}
