import { RouterContext } from '@/main'
import { ApiResponse } from '@/types/api/http'
import { prefetchOptions } from '@/util/preFetcher'
import { createFileRoute } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import AdminNotifications from '@/components/pagesComponents/AdminNotifications'
import { queryKeys } from '@/util/queryKeysFactory'
import { AdminNotificationEntity } from '@/components/pagesComponents/AdminNotifications/Config'
import { cleanObject, searchParamsValidate } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'
import { routePermission } from '@/lib/utils'

export const Route = createFileRoute('/_main/admin-notifications/')({
  beforeLoad: ({ context }) => {
    routePermission('admin-notifications', 'index')
    return context
  },
  component: Index,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.admin_notifications' }} />,

  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.adminNotifications.filterd(search),
        endpoint: `admin-notifications?paginate=1`,
        params: search,
      }),
    )
  },
})

function Index() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponse<AdminNotificationEntity[], 'admin-notifications'>>({
    queryKey: queryKeys.adminNotifications.filterd(search),
    endpoint: `admin-notifications?paginate=1`,
    suspense: true,
    params: { ...search },
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.admin_notifications" />
      <AdminNotifications data={data!} />
    </>
  )
}
