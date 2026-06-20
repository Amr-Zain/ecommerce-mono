import Categories from '@/components/pagesComponents/Categories'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { Category } from '@/types/api/faq'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/categories/')({
  beforeLoad: ({ context }) => {
    routePermission('collections', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[parent_id]': toStr(search['filters[parent_id]']),
    custom_filter: toStr(search.custom_filter) || "collection",
  }),
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      'filters[parent_id]': toStr(search['filters[parent_id]']),
      custom_filter: toStr(search.custom_filter),
    })
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.categories' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.categories.filterd(search),
        endpoint: 'collections?paginate=1',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<Category[], 'categories'>>({
    queryKey: queryKeys.categories.filterd({ ...search, paginate: '1' }),
    endpoint: 'collections?paginate=1',
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.categories" />
      <Categories data={data!} />
    </>
  )
}
