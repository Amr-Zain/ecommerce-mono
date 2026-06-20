import NotificationsTable from '@/components/pagesComponents/Notifications'
import useFetch from '@/hooks/UseFetch'
import { RouterContext } from '@/main'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'
import { cleanObject, searchParamsValidate, toStr } from '@/types/api/general'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { TableLoader } from '@/components/common/table/TableLoader'

export type Notification = {
  id: string
  title: string
  body: string
  type: string
  created_at: string
  is_read: boolean
  notify_id: number
  additional_data?: {
    notification_type?: string
    actor_name?: string
    user_name?: string
    id?: string | number
    user_id?: string | number
    order_id?: string | number
    product_id?: string | number
  }
}

export interface NotificationsResponse {
  unread_notifications_count: number
  [key: `${string}_notifications`]: {
    data: Notification[]
    links: {
      first: string
      last: string
      prev: string | null
      next: string | null
    }
    meta: {
      current_page: number
      from: number
      last_page: number
      links: {
        url: string | null
        label: string
        active: boolean
        page: number | null
      }[]
      path: string
      per_page: number
      to: number
      total: number
    }
  }
}

export const Route = createFileRoute('/_main/settings/notifications/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    ...searchParamsValidate(search),
    'filters[type]': toStr(search['filters[type]']),
    'filters[is_read]': toStr(search['filters[is_read]']),
  }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.notifications' }} />,
  loaderDeps: ({ search }) => ({
    search: cleanObject({
      ...searchParamsValidate(search),
      'filters[type]': toStr(search['filters[type]']),
      'filters[is_read]': toStr(search['filters[is_read]']),
    })
  }),
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.notifications.filterd(search),
        endpoint: 'notifications',
        params: search,
      }),
    )
  },
})

function RouteComponent() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<
    ApiResponseBase<NotificationsResponse>
  >({
    queryKey: queryKeys.notifications.filterd(search),
    endpoint: 'notifications',
    suspense: true,
    params: search,
  })

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.notifications" />
      <NotificationsTable data={data!} />
    </>
  )
}
