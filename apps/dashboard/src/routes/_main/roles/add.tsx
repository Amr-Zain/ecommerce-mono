import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import RoleForm from '@/components/pagesComponents/Roles/Form'
import { RoleFormSkeleton } from '@/components/pagesComponents/Roles/RoleFormSkeleton'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/roles/add')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'store')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="add" />
      <RoleFormSkeleton />
    </>
  ),
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.roles"
        entityTo="/roles"
        action="add"
      />
      <RoleForm />
    </>
  )
}
