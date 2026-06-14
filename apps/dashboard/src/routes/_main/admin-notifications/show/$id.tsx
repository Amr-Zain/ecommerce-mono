import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { queryKeys } from '@/util/queryKeysFactory'
import { AdminNotificationDetail } from '@/components/pagesComponents/AdminNotifications/Config'
import { prefetchOptions } from '@/util/preFetcher'
import { RouterContext } from '@/main'
import AdminNotificationShow from '@/components/pagesComponents/AdminNotifications/Show'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/admin-notifications/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('admin-notifications', 'show')
    return context
  },
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const { queryClient } = context as RouterContext
    const endpoint = `admin-notifications/${params.id}`
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.adminNotifications.get(params.id),
        endpoint,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<AdminNotificationDetail>>({
    queryKey: queryKeys.adminNotifications.get(id),
    endpoint: `admin-notifications/${id}`,
    suspense: true,
  })

  return (
    <>
      <SmartBreadcrumbs
        entityKey="menu.admin_notifications"
        entityTo="/admin-notifications"
        action="show"
      />
      <AdminNotificationShow notification={data?.data as AdminNotificationDetail} />
    </>
  )
}
