const DASHBOARD_ORIGIN = 'https://dashboard.local'

export function getSafeDashboardRedirect(value: unknown) {
  if (typeof value !== 'string') return '/'

  const candidate = value.trim()
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '/'

  try {
    const url = new URL(candidate, DASHBOARD_ORIGIN)
    if (url.origin !== DASHBOARD_ORIGIN || url.pathname.startsWith('/auth')) {
      return '/'
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

export function getDashboardLoginUrl(returnTo: unknown) {
  const redirect = getSafeDashboardRedirect(returnTo)
  if (redirect === '/') return '/auth/login'

  const params = new URLSearchParams({ redirect })
  return `/auth/login?${params.toString()}`
}
