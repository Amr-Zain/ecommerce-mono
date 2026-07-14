import { useEffect } from 'react'
import type { ReactNode } from 'react'

import LoaderPage from '@/components/layout/Loader'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import {
  isDashboardSessionUnavailable,
  subscribeDashboardSessionSync,
} from '@/lib/dashboard-session'

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
  const profile = useDashboardProfile()

  useEffect(() => subscribeDashboardSessionSync(), [])

  if (!isDashboardSessionUnavailable() && profile.isPending) {
    return <LoaderPage />
  }
  return children
}
