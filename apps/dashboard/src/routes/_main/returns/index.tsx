import Returns from '@/components/pagesComponents/Returns'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { routePermission } from '@/lib/utils'
import { RouterContext } from '@/main'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { ApiResponseBase, Meta } from '@/types/api/http'
import { ReturnRequest } from '@/types/api/order'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/returns/')({
  beforeLoad: ({ context }) => {
    routePermission('returns', 'index')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.returns' }} />
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
        queryKey: queryKeys.returns.filterd(search),
        endpoint: 'returns',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponseBase<{ items: ReturnRequest[]; meta?: Meta }>>({
    queryKey: queryKeys.returns.filterd(search),
    endpoint: 'returns',
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.returns" />
      <Returns data={data!} />
    </>
  )
}
