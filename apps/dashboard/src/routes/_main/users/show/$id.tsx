import { RouterContext } from '@/main'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { UserShow as UserShowType } from '@/components/pagesComponents/Users/Config'
import { UserShow } from '@/components/pagesComponents/Users/Show'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import UserShowSkeleton from '@/components/pagesComponents/Users/Show/UserShowSkeleton'

const endpoint = (id: string) => `clients/${id}`

import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/users/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('clients', 'show')
    return context
  },
  component: UserShowRoute,
  loader: ({ context, params: { id } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.user.getUser(id),
        endpoint: endpoint(id),
      }),
    )
  },
  pendingComponent: UserShowSkeleton,
})

function UserShowRoute() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<UserShowType>>({
    queryKey: queryKeys.user.getUser(id),
    endpoint: endpoint(id),
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.users"
        entityTo="/users"
        action="show"
      />
      <UserShow user={data!.data} />
    </>
  )
}
