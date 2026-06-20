import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { RoleShow as ShowComponent } from '@/components/pagesComponents/Roles/Show'
import { RoleShowSkeleton } from '@/components/pagesComponents/Roles/RoleShowSkeleton'
import { RouterContext } from '@/main'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/roles/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'show')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="show" />
      <RoleShowSkeleton />
    </>
  ),
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    const id = params.id
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.roles.get(id),
        endpoint: `roles/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="show" />
      <ShowComponent />
    </>
  )
}
