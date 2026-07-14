import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

import type {
  DashboardAuthResponse,
  DashboardMeResponse,
  DashboardProfileResponse,
} from '@/types/api/auth'
import type { DashboardSession, DashboardUser } from '@/types/auth'
import {
  getAccessTokenUserType,
  isDashboardUser,
  mapDashboardAuthResponse,
  mapDashboardUser,
  unwrapApiData,
} from '@/lib/dashboardAuth'
import { API_BASE_URL } from '@/lib/env'
import { getDashboardLoginUrl } from '@/lib/auth-redirect'
import { queryClient } from '@/components/providers/tabstackQueryProvider'
import { queryKeys } from '@/util/queryKeysFactory'

const AUTH_CHANNEL_NAME = 'dashboard-auth-session'
const REFRESH_LOCK_NAME = 'dashboard-auth-refresh'
const SESSION_HINT_KEY = 'dashboard-session-active'
const ADMIN_AUTH_HEADERS = {
  'x-platform': 'browser',
  'x-user-type': 'admin',
} as const

type AuthChannelMessage =
  | { type: 'session-updated'; session: DashboardSession }
  | { type: 'session-cleared' }

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let accessToken: string | null = null
let refreshInFlight: Promise<DashboardSession> | null = null
let authChannel: BroadcastChannel | null = null
let sessionUnavailable = !hasSessionHint()

function hasSessionHint() {
  return (
    typeof window !== 'undefined' &&
    window.localStorage.getItem(SESSION_HINT_KEY) === '1'
  )
}

function setSessionHint(active: boolean) {
  if (typeof window === 'undefined') return
  if (active) {
    window.localStorage.setItem(SESSION_HINT_KEY, '1')
  } else {
    window.localStorage.removeItem(SESSION_HINT_KEY)
  }
  // Remove the old persisted Zustand payload during the auth migration.
  window.localStorage.removeItem('auth-storage')
}

function getAuthChannel() {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }
  authChannel ??= new BroadcastChannel(AUTH_CHANNEL_NAME)
  return authChannel
}

function publishAuthMessage(message: AuthChannelMessage) {
  getAuthChannel()?.postMessage(message)
}

function redirectToLogin() {
  if (
    typeof window === 'undefined' ||
    window.location.pathname === '/auth/login'
  ) {
    return
  }
  window.location.replace(
    getDashboardLoginUrl(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    ),
  )
}

function mergeSessionUser(
  current: DashboardUser | undefined,
  next: DashboardUser,
) {
  if (!current) return next
  return {
    ...current,
    ...next,
    session_id: next.session_id ?? current.session_id,
    image: next.image ?? current.image,
    settings: { ...current.settings, ...next.settings },
    permissions:
      Object.keys(next.permissions).length > 0
        ? next.permissions
        : current.permissions,
  }
}

export function getDashboardAccessToken() {
  return accessToken
}

export function isDashboardSessionUnavailable() {
  return sessionUnavailable
}

export function setDashboardSession(
  session: DashboardSession,
  broadcast = true,
) {
  sessionUnavailable = false
  accessToken = session.accessToken
  setSessionHint(true)
  const current = queryClient.getQueryData<DashboardUser>(
    queryKeys.auth.profile(),
  )
  const user = mergeSessionUser(current, session.user)
  queryClient.setQueryData(queryKeys.auth.profile(), user)
  if (broadcast) {
    publishAuthMessage({
      type: 'session-updated',
      session: { accessToken: session.accessToken, user },
    })
  }
  return user
}

export function clearDashboardSession({
  broadcast = true,
  redirect = true,
}: { broadcast?: boolean; redirect?: boolean } = {}) {
  sessionUnavailable = true
  accessToken = null
  setSessionHint(false)
  void queryClient.cancelQueries({ queryKey: queryKeys.auth.all() })
  queryClient.removeQueries({ queryKey: queryKeys.auth.all() })
  if (broadcast) publishAuthMessage({ type: 'session-cleared' })
  if (redirect) redirectToLogin()
}

export function subscribeDashboardSessionSync() {
  const channel = getAuthChannel()
  if (!channel) return () => undefined

  const handleMessage = (event: MessageEvent<AuthChannelMessage>) => {
    if (event.data.type === 'session-updated') {
      setDashboardSession(event.data.session, false)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile(),
      })
      return
    }
    clearDashboardSession({ broadcast: false, redirect: true })
  }

  channel.addEventListener('message', handleMessage)
  return () => channel.removeEventListener('message', handleMessage)
}

export function isAccessTokenUsable(token?: string | null) {
  try {
    const payload = token?.split('.')[1]
    if (!payload) return false
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    ) as {
      exp?: number
      type?: string
      userType?: string
    }
    return (
      decoded.type === 'access' &&
      decoded.userType === 'admin' &&
      Boolean(decoded.exp) &&
      decoded.exp! * 1000 > Date.now() + 5_000
    )
  } catch {
    return false
  }
}

async function refreshOnce(failedToken?: string | null) {
  const currentUser = queryClient.getQueryData<DashboardUser>(
    queryKeys.auth.profile(),
  )
  if (
    currentUser &&
    accessToken &&
    accessToken !== failedToken &&
    isAccessTokenUsable(accessToken)
  ) {
    return { accessToken, user: currentUser }
  }

  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: ADMIN_AUTH_HEADERS,
    },
  )
  const response = unwrapApiData<DashboardAuthResponse>(data)
  const session = mapDashboardAuthResponse(response)

  if (
    getAccessTokenUserType(session.accessToken) !== 'admin' ||
    !isDashboardUser(session.user)
  ) {
    throw new Error('Refresh token does not belong to a dashboard user')
  }

  setDashboardSession(session)
  return session
}

async function withRefreshLock<T>(callback: () => Promise<T>) {
  const locks =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator as unknown as { locks?: LockManager }).locks
  return locks ? locks.request(REFRESH_LOCK_NAME, callback) : callback()
}

export function refreshDashboardSession(failedToken?: string | null) {
  if (!refreshInFlight) {
    refreshInFlight = withRefreshLock(() => refreshOnce(failedToken))
      .catch((error) => {
        const currentUser = queryClient.getQueryData<DashboardUser>(
          queryKeys.auth.profile(),
        )
        if (
          currentUser &&
          accessToken &&
          accessToken !== failedToken &&
          isAccessTokenUsable(accessToken)
        ) {
          return { accessToken, user: currentUser }
        }
        clearDashboardSession()
        throw error
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

async function requestDashboardProfile(token: string) {
  const config = {
    headers: {
      ...ADMIN_AUTH_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  }
  const [identityResponse, profileResponse] = await Promise.all([
    axios.get(`${API_BASE_URL}/auth/me`, config),
    axios.get(`${API_BASE_URL}/client/profile`, config),
  ])
  const identity = unwrapApiData<DashboardMeResponse>(identityResponse.data)
  const profile = unwrapApiData<DashboardProfileResponse>(
    profileResponse.data,
  )
  const current = queryClient.getQueryData<DashboardUser>(
    queryKeys.auth.profile(),
  )
  const user = mapDashboardUser(
    {
      ...profile,
      ...identity,
      avatar: profile.avatar ?? profile.image,
      settings: profile.settings,
      location: profile.location,
      country: profile.country,
    },
    current?.session_id,
    current,
  )

  if (!isDashboardUser(user)) {
    throw new Error('Profile does not belong to a dashboard user')
  }
  return user
}

export async function fetchDashboardProfile() {
  if (sessionUnavailable && !accessToken) {
    throw new Error('Dashboard session is not available')
  }

  let token = accessToken
  if (!isAccessTokenUsable(token)) {
    token = (await refreshDashboardSession(token)).accessToken
  }
  if (!token) throw new Error('Dashboard access token is not available')

  try {
    return await requestDashboardProfile(token)
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error
    }
    const session = await refreshDashboardSession(token)
    return requestDashboardProfile(session.accessToken)
  }
}

function requestAccessToken(config: RetryableRequest) {
  const authorization = config.headers.Authorization
  if (typeof authorization !== 'string') return accessToken
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : null
}

function isRefreshEligible(url?: string) {
  if (!url) return true
  return !/\/auth\/(?:login|login-otp|refresh|register|send-otp|forgot-password|reset-password)(?:\?|$)/.test(
    url,
  )
}

export function installDashboardRefreshInterceptor(instance: AxiosInstance) {
  return instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest | undefined
      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        !isRefreshEligible(originalRequest.url)
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      try {
        const session = await refreshDashboardSession(
          requestAccessToken(originalRequest),
        )
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
        return instance(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    },
  )
}

export { ADMIN_AUTH_HEADERS }
