import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { showRoomsQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import ShowRoomForm from '@/components/pagesComponents/ShowRooms/Form'
import { ShowRoomDetail } from '@/types/api/showRoom'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/show-rooms/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('show-rooms', 'update')
    return context
  },
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: showRoomsQueryKeys.getShowRoom(params.id),
        endpoint: `show-rooms/${params.id}`,
      }),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponse<ShowRoomDetail>>({
    queryKey: showRoomsQueryKeys.getShowRoom(id),
    endpoint: `show-rooms/${id}`,
    suspense: true,
  })
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.showRooms"
        entityTo="/show-rooms"
        action="edit"
      />
      <ShowRoomForm showRoom={data?.data as any} />
    </>
  )
}
