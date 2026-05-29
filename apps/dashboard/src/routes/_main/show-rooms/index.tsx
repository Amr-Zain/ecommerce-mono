import ShowRooms from '@/components/pagesComponents/ShowRooms'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { showRoomsQueryKeys } from '@/util/queryKeysFactory'
import { ShowRoom } from '@/types/api/showRoom'
import { searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

import { routePermission } from '@/lib/utils'

const endpoint = 'show-rooms?paginate=1'

export const Route = createFileRoute('/_main/show-rooms/')({
  beforeLoad: ({ context }) => {
    routePermission('show-rooms', 'index')
    return context
  },
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) =>
    searchParamsValidate(search),
  loaderDeps: ({ search }) => ({
    search: searchParamsValidate(search),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.showRooms' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: showRoomsQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<ShowRoom[], 'show_rooms'>>({
    queryKey: showRoomsQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.showRooms" />
      <ShowRooms data={data!} />
    </>
  )
}
