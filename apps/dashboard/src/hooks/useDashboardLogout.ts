import type { ApiResponse } from '@/types/api/http'
import {
  ADMIN_AUTH_HEADERS,
  clearDashboardSession,
} from '@/lib/dashboard-session'
import { useMutate } from '@/hooks/UseMutate'

export function useDashboardLogout() {
  return useMutate<ApiResponse, Record<string, never>>({
    endpoint: 'auth/logout',
    mutationKey: ['auth', 'logout'],
    method: 'post',
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    onSuccess: () => clearDashboardSession(),
  })
}
