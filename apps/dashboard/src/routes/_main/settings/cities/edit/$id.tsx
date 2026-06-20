import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CityForm from '@/components/pagesComponents/Settings/cities/CityFrom'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { City } from '@/types/api/country'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/cities/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('cities', 'update')
    return context
  },
  component: RouteComponent,
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.cities.getCity(params.id),
        endpoint: `cities/${params.id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<City>, City>({
    queryKey: queryKeys.cities.getCity(id),
    endpoint: `cities/${id}`,
    suspense: true,
    select: (data) => data.data as unknown as City,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.cities"
        entityTo="/settings/cities"
        action="edit"
      />
      <CityForm city={data} />
    </>
  )
}
