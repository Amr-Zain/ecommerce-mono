import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Dashboard } from '@/components/pagesComponents/Dashboard'
import { createFileRoute } from '@tanstack/react-router'
import { prefetchOptions } from '@/util/preFetcher'
import { dashboardQueryKeys } from '@/util/queryKeysFactory'
import { RouterContext } from '@/main'
import useFetch from '@/hooks/UseFetch'
import { DashboardStatistics } from '@/types/api/dashboard'
import { ApiResponseBase } from '@/types/api/http'

import { DashboardSkeleton } from '@/components/pagesComponents/Dashboard/Skeleton'
import { z } from 'zod/v4'
import { useAuthStore } from '@/stores/authStore'
import { hasPermission } from '@/lib/utils'

const dashboardSearchSchema = z.object({
  tab: z.string().optional().catch('overview'),
})

export const Route = createFileRoute('/_main/')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: Index,
  pendingComponent: DashboardSkeleton,
  loader: async ({ context }) => {
    const { queryClient } = context as RouterContext
    const hasHomePermission = hasPermission('dashboard-home', 'index')
    if (!hasHomePermission) {
      return
    }
    await queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: dashboardQueryKeys.statistics(),
        endpoint: 'dashboard/home',
      }),
    )
  },
})

function Index() {
  const hasHomePermission = useAuthStore((state) => (state.user?.permissions["dashboard-home"] || []).includes("index"))
  const { data } = useFetch<ApiResponseBase<DashboardStatistics>>({
    queryKey: dashboardQueryKeys.statistics(),
    endpoint: 'dashboard/home',
    // suspense: true,
    enabled: hasHomePermission!!
  })

  return (
    <>
      <SmartBreadcrumbs />
      <Dashboard data={data?.data} hasHomePermission={hasHomePermission!!} />
    </>
  )
}

export default Index
