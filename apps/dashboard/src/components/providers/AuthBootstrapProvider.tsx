import { ReactNode, useEffect } from 'react'
import axios from 'axios'
import LoaderPage from '@/components/layout/Loader'
import {
  DashboardAuthResponse,
  DashboardApiUser,
  getAccessTokenUserType,
  isDashboardUser,
  mapDashboardAuthResponse,
  mapDashboardUser,
  unwrapApiData,
} from '@/lib/dashboardAuth'
import { useAuthStore, type UserAuth } from '@/stores/authStore'

type AuthProfileResponse = DashboardApiUser

const authApi = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
})

let inFlightRestore: Promise<UserAuth> | null = null

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
  const isAuthReady = useAuthStore((state) => state.isAuthReady)

  useEffect(() => {
    let cancelled = false

    const bootstrapSession = async () => {
      const { setUser, clearUser, setAuthReady } = useAuthStore.getState()

      try {
        const user = await restoreDashboardSession()
        if (!cancelled) setUser(user)
      } catch {
        if (!cancelled) clearUser()
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    bootstrapSession()

    return () => {
      cancelled = true
    }
  }, [])

  if (!isAuthReady) {
    return <LoaderPage />
  }

  return children
}

async function restoreDashboardSession() {
  if (!inFlightRestore) {
    inFlightRestore = restoreDashboardSessionOnce().finally(() => {
      inFlightRestore = null
    })
  }

  return inFlightRestore
}

async function restoreDashboardSessionOnce() {
  const token = useAuthStore.getState().token

  if (token) {
    try {
      const { data } = await authApi.get('auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const user = mapDashboardUser(unwrapApiData<AuthProfileResponse>(data), token)

      if (!isDashboardUser(user)) {
        throw new Error('Stored session is not a dashboard user')
      }

      return user
    } catch {
      return refreshDashboardSession()
    }
  }

  return refreshDashboardSession()
}

async function refreshDashboardSession() {
  const { data } = await authApi.post(
    'auth/refresh',
    {},
    {
      withCredentials: true,
      headers: {
        'x-platform': 'browser',
        'x-user-type': 'admin',
      },
    },
  )
  const response = unwrapApiData<DashboardAuthResponse>(data)
  const user = mapDashboardAuthResponse(response)

  if (getAccessTokenUserType(user.token) !== 'admin' || !isDashboardUser(user)) {
    throw new Error('Refresh token does not belong to a dashboard user')
  }

  return user
}
