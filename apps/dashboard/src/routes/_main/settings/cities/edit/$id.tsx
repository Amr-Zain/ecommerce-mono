import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CityForm from '@/components/pagesComponents/Settings/cities/CityFrom'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { City } from '@/types/api/country'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { citiesQueryKeys } from '@/util/queryKeysFactory'
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
    const endpoint = `cities/${params.id}`
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: citiesQueryKeys.getCity(params.id),
        endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<City>, City>({
    queryKey: citiesQueryKeys.getCity(id),
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
