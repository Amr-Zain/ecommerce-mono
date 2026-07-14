import { createFileRoute } from '@tanstack/react-router'

import type { RouterContext } from '@/main'
import type { ApiResponse } from '@/types/api/http'
import type { StaticPage } from '@/types/api/staticPages'
import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import StaticPages from '@/components/pagesComponents/StaticPages'
import useFetch from '@/hooks/UseFetch'
import { searchParamsValidate } from '@/types/api/general'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/static-pages/')({
  beforeLoad: ({ context }) => {
    routePermission('static-pages', 'index')
    return context
  },
  component: Index,
  validateSearch: (search: Record<string, unknown>) =>
    searchParamsValidate(search),
  pendingComponent: () => (
    <TableLoader breadcrumbs={{ entityKey: 'menu.pages' }} />
  ),
  loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.pages.filterd(search),
        endpoint: `static-pages?paginate=1`,
        params: search,
      }),
    )
  },
})

function Index() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Array<StaticPage>, 'static_pages'>>({
    queryKey: queryKeys.pages.filterd(search),
    endpoint: `static-pages?paginate=1`,
    suspense: true,
    params: { ...search },
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.static-pages" />
      <StaticPages data={data} />
    </>
  )
}
