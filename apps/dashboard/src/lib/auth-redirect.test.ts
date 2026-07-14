import { describe, expect, it } from 'vitest'

import {
  getDashboardLoginUrl,
  getSafeDashboardRedirect,
} from '@/lib/auth-redirect'

describe('dashboard auth redirects', () => {
  it('keeps an internal dashboard path with its search and hash', () => {
    expect(getSafeDashboardRedirect('/orders?page=3#recent')).toBe(
      '/orders?page=3#recent',
    )
  })

  it.each([
    undefined,
    '',
    'orders',
    'https://example.com/orders',
    '//example.com/orders',
    '/auth/login',
    '/auth/reset-password',
  ])('falls back to the dashboard root for unsafe value %s', (value) => {
    expect(getSafeDashboardRedirect(value)).toBe('/')
  })

  it('builds an encoded login URL for an internal return path', () => {
    expect(getDashboardLoginUrl('/orders?page=3')).toBe(
      '/auth/login?redirect=%2Forders%3Fpage%3D3',
    )
  })
})
