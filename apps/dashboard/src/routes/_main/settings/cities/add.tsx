import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import CityForm from '@/components/pagesComponents/Settings/cities/CityFrom'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/settings/cities/add')({
  beforeLoad: ({ context }) => {
    routePermission('cities', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.cities"
        entityTo="/settings/cities"
        action="add"
      />
      <CityForm />
    </>
  )
}
