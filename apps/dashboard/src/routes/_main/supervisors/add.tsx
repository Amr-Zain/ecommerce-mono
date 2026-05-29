import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import SupervisorForm from '@/components/pagesComponents/Supervisors/Form'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/supervisors/add')({
  beforeLoad: ({ context }) => {
    routePermission('supervisors', 'store')
    return context
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.supervisors" entityTo='/supervisors' action='add' />
      <SupervisorForm />
    </>)
}
