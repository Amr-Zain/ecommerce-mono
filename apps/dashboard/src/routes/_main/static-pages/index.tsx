import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import StaticPages from '@/components/pagesComponents/StaticPages'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { StaticPage } from '@/types/api/staticPages'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/static-pages/')({
  beforeLoad: ({ context }) => {
    routePermission('static-pages', 'index')
    return context
  },
  component: Index,
  validateSearch: (search: Record<string, unknown>): { search?: string } => {
    return {
      search: search.search as string,
    }
  },
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.pages' }} />,
  loaderDeps: ({ search }) => ({
    search: {
      search: search.search as string,
    }
  }),
  loader: async ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.pages.filterd(search),
        endpoint: `static-pages?paginate=1`,
        params: search,
      }),
    )
  },
  //beforeLoad:({location})=> checkPermission(/* location.href */'users.index'),
})

function Index() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<StaticPage[], 'static_pages'>>({
    queryKey: queryKeys.pages.filterd(search),
    endpoint: `static-pages?paginate=1`,
    suspense: true,
    params: { ...search },
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.static-pages" />
      <StaticPages data={data!} />
    </>
  )
}
