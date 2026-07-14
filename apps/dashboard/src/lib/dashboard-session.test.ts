// @vitest-environment jsdom

import axios, { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import {
  clearDashboardSession,
  fetchDashboardProfile,
  getDashboardAccessToken,
  installDashboardRefreshInterceptor,
  isDashboardSessionUnavailable,
  refreshDashboardSession,
} from '@/lib/dashboard-session'

function accessToken(expiresInSeconds = 300) {
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      type: 'access',
      userType: 'admin',
    }),
  )
  return `header.${payload}.signature`
}

function authResponse(token = accessToken()) {
  return {
    data: {
      access_token: token,
      session_id: '22',
      user: {
        id: '7',
        name: 'Admin',
        email: 'admin@example.com',
        user_type: 'admin',
        is_active: true,
        role: { id: '1', name: 'Admin', permissions: {} },
      },
    },
  }
}

describe('dashboard refresh coordination', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/auth/login')
    clearDashboardSession({ broadcast: false, redirect: false })
  })

  afterEach(() => vi.restoreAllMocks())

  it('uses one refresh request for simultaneous callers', async () => {
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue(authResponse())

    const [first, second] = await Promise.all([
      refreshDashboardSession(null),
      refreshDashboardSession(null),
    ])

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(first.user.session_id).toBe('22')
    expect(second.accessToken).toBe(first.accessToken)
    expect(getDashboardAccessToken()).toBe(first.accessToken)
  })

  it('loads identity and the client profile route after refresh', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue(authResponse())
    const get = vi.spyOn(axios, 'get').mockImplementation((url) => {
      if (String(url).endsWith('/auth/me')) {
        return Promise.resolve({
          data: {
            id: '7',
            name: 'Admin',
            email: 'admin@example.com',
            phone: null,
            user_type: 'admin',
            is_active: true,
            is_email_verified: true,
            is_phone_verified: false,
            role: { id: '1', name: 'Admin', permissions: {} },
          },
        })
      }
      return Promise.resolve({
        data: {
          id: '7',
          name: 'Admin',
          email: 'admin@example.com',
          phone: null,
          phone_code: null,
          user_type: 'admin',
          is_active: true,
          is_email_verified: true,
          is_phone_verified: false,
          settings: { language: 'en' },
        },
      })
    })

    await refreshDashboardSession(null)
    await fetchDashboardProfile()

    expect(get).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/me$/),
      expect.any(Object),
    )
    expect(get).toHaveBeenCalledWith(
      expect.stringMatching(/\/client\/profile$/),
      expect.any(Object),
    )
  })

  it('does not call refresh on a first visit without a session marker', async () => {
    const refresh = vi.spyOn(axios, 'post')

    await expect(fetchDashboardProfile()).rejects.toThrow(
      'Dashboard session is not available',
    )

    expect(refresh).not.toHaveBeenCalled()
  })

  it('stops bootstrapping after one failed refresh', async () => {
    const refresh = vi.spyOn(axios, 'post').mockRejectedValue(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
      } as AxiosResponse),
    )

    await expect(refreshDashboardSession(null)).rejects.toBeInstanceOf(
      AxiosError,
    )
    await expect(fetchDashboardProfile()).rejects.toThrow(
      'Dashboard session is not available',
    )

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(isDashboardSessionUnavailable()).toBe(true)
  })

  it('does not attempt refresh after a failed password login', async () => {
    const refresh = vi.spyOn(axios, 'post')
    const instance = axios.create({
      adapter: (config: InternalAxiosRequestConfig) => {
        const response = {
          config,
          data: { message: 'Invalid credentials' },
          headers: {},
          status: 401,
          statusText: 'Unauthorized',
        } as AxiosResponse
        return Promise.reject(
          new AxiosError(
            'Unauthorized',
            'ERR_BAD_REQUEST',
            config,
            undefined,
            response,
          ),
        )
      },
    })
    installDashboardRefreshInterceptor(instance)

    await expect(instance.post('/auth/login', {})).rejects.toBeInstanceOf(
      AxiosError,
    )
    expect(refresh).not.toHaveBeenCalled()
  })
})
