import { TableLoader } from '@/components/common/table/TableLoader'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import Cities from '@/components/pagesComponents/Settings/cities'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { City } from '@/types/api/country'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/cities/')({
  beforeLoad: ({ context }) => {
    routePermission('cities', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) =>
  ({
    ...searchParamsValidate(search),
    'filters[country_id]': toStr(search['filters[country_id]']),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.cities' }} />,
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      'filters[country_id]': toStr(search['filters[country_id]']),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.cities.filterd(search),
        endpoint: 'cities?paginate=1',
        params: search,
      }),
    )
  },
})


function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<City[], 'cities'>>({
    queryKey: queryKeys.cities.filterd(search),
    endpoint: 'cities?paginate=1',
    suspense: true,
    params: search,
  })


  return (
    <>
      <SmartBreadcrumbs entityKey="menu.cities" />
      <Cities data={data!} />
    </>
  )
}
