import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  fetchDashboardProfile,
  isDashboardSessionUnavailable,
} from '@/lib/dashboard-session'
import { queryKeys } from '@/util/queryKeysFactory'

export const dashboardProfileQueryOptions = queryOptions({
  queryKey: queryKeys.auth.profile(),
  queryFn: fetchDashboardProfile,
  staleTime: 5 * 60 * 1_000,
  retry: false,
  refetchOnWindowFocus: false,
})

export function useDashboardProfile() {
  return useQuery({
    ...dashboardProfileQueryOptions,
    enabled: !isDashboardSessionUnavailable(),
  })
}
