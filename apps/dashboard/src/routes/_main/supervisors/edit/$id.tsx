import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import SupervisorForm from '@/components/pagesComponents/Supervisors/Form'
import useFetch from '@/hooks/UseFetch'
import type { RouterContext } from '@/main'
import { ApiResponseBase } from '@/types/api/http'
import { Supervisor } from '@/types/api/user'
import { prefetchOptions } from '@/util/preFetcher'
import { supervisorsQueryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/supervisors/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('supervisors', 'update')
    return context
  },
  component: RouteComponent,
  loader: ({ params, context }) => {
    const { queryClient } = context as RouterContext
    const endpoint = `supervisors/${params.id}`
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: supervisorsQueryKeys.get(params.id),
        endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Supervisor>, Supervisor>({
    queryKey: supervisorsQueryKeys.get(id),
    endpoint: `supervisors/${id}`,
    suspense: true,
    select: (data) => data.data as unknown as Supervisor,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.supervisors" entityTo='/supervisors' action='edit' />
      <SupervisorForm supervisor={data} />
    </>
  )
}
