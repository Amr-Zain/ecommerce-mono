import { createFileRoute } from '@tanstack/react-router'
import ShowRoomForm from '@/components/pagesComponents/ShowRooms/Form'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/show-rooms/add')({
  beforeLoad: ({ context }) => {
    routePermission('show-rooms', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.showRooms"
        entityTo="/show-rooms"
        action="add"
      />
      <ShowRoomForm />
    </>
  )
}
