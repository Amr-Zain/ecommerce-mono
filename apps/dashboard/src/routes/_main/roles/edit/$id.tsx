import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Role } from '@/components/pagesComponents/Roles/Config'
import RoleForm from '@/components/pagesComponents/Roles/Form'
import { RoleFormSkeleton } from '@/components/pagesComponents/Roles/RoleFormSkeleton'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
const endpoint = `roles`

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/roles/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'update')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="edit" />
      <RoleFormSkeleton />
    </>
  ),
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    const id = params.id
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.roles.get(id),
        endpoint: `${endpoint}/${id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Role>, Role>({
    queryKey: queryKeys.roles.get(id),
    endpoint: `${endpoint}/${id}`,
    suspense: true,
    select: (data) => data.data as unknown as Role,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="edit" />
      <RoleForm role={data} />
    </>
  )
}
