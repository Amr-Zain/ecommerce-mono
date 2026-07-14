import type {
  DashboardSession,
  DashboardUser,
  PermissionAction,
  UserPermissions,
} from '@/types/auth'
import type {
  DashboardApiPermissions,
  DashboardAuthResponse,
  DashboardUserApiShape,
} from '@/types/api/auth'

export function unwrapApiData<T>(payload: any): T {
  return (payload?.data ?? payload) as T
}

export function getAccessTokenUserType(accessToken?: string | null) {
  try {
    const payload = accessToken?.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )
    return typeof decoded.userType === 'string' ? decoded.userType : null
  } catch {
    return null
  }
}

export function isDashboardUser(
  user?: Pick<DashboardUser, 'user_type'> | null,
) {
  return user?.user_type === 'admin' || user?.user_type === 'super_admin'
}

export function mapDashboardAuthResponse(
  response: Partial<DashboardAuthResponse>,
): DashboardSession {
  const token = response.access_token
  const sessionId = response.session_id
  if (!response.user || !token) {
    throw new Error('Invalid dashboard auth response')
  }

  return {
    accessToken: token,
    user: mapDashboardUser(response.user, sessionId),
  }
}

export function mapDashboardUser(
  apiUser: DashboardUserApiShape,
  sessionId?: string,
  current?: DashboardUser | null,
): DashboardUser {
  const roleName = apiUser.role?.name ?? ''
  const apiUserType = apiUser.user_type
  const permissions = apiUser.role?.permissions
    ? normalizePermissions(apiUser.role.permissions)
    : current?.permissions ?? {}
  const settings = apiUser.settings

  return {
    id: Number(apiUser.id),
    session_id: sessionId ?? current?.session_id,
    name: apiUser.name ?? current?.name ?? '',
    email: apiUser.email ?? current?.email ?? '',
    phone_code:
      apiUser.phone_code ?? current?.phone_code ?? '',
    phone: apiUser.phone ?? current?.phone ?? '',
    gender: apiUser.gender ?? current?.gender ?? null,
    birth_date: apiUser.birth_date ?? current?.birth_date ?? null,
    country: apiUser.country ?? current?.country ?? null,
    image: apiUser.avatar ?? apiUser.image ?? current?.image ?? null,
    user_type:
      roleName === 'Super Admin'
        ? 'super_admin'
        : apiUserType === 'admin' || apiUserType === 'super_admin'
          ? apiUserType
          : roleName
            ? 'admin'
            : current?.user_type ?? 'user',
    is_active:
      apiUser.is_active ?? current?.is_active ?? true,
    is_email_verified:
      apiUser.is_email_verified ??
      current?.is_email_verified ??
      false,
    is_phone_verified:
      apiUser.is_phone_verified ?? current?.is_phone_verified ?? false,
    is_banned:
      apiUser.is_banned ?? current?.is_banned ?? false,
    is_suspended:
      apiUser.is_suspended ??
      current?.is_suspended ??
      false,
    settings: {
      language:
        settings?.language === 'ar' || settings?.language === 'en'
          ? settings.language
          : current?.settings.language ?? 'en',
      allow_notifications:
        settings?.allow_notifications ??
        current?.settings.allow_notifications ??
        true,
      market: settings?.market ?? current?.settings.market,
    },
    location: {
      lat: apiUser.location?.lat ?? current?.location.lat ?? 0,
      lng: apiUser.location?.lng ?? current?.location.lng ?? 0,
    },
    addresses: apiUser.addresses ?? current?.addresses,
    tier: apiUser.tier ?? current?.tier,
    loyalty: apiUser.loyalty ?? current?.loyalty,
    permissions,
    role: apiUser.role
      ? {
          id: Number(apiUser.role.id),
          name: roleName,
        }
      : undefined,
  }
}

function normalizePermissions(
  rawPermissions: DashboardApiPermissions,
): UserPermissions {
  const permissions: UserPermissions = {}

  Object.entries(rawPermissions).forEach(([key, actions]) => {
    const mappedActions = mapActions(actions)

    addPermissionKey(permissions, key, mappedActions)
    addPermissionKey(permissions, key.replace(/_/g, '-'), mappedActions)
    addPermissionKey(permissions, key.replace(/-/g, '_'), mappedActions)

    if (key === 'clients') {
      addPermissionKey(permissions, 'users', mappedActions)
    }
    if (key === 'dashboard') {
      addPermissionKey(permissions, 'dashboard-home', mappedActions)
    }
  })

  return permissions
}

function addPermissionKey(
  permissions: UserPermissions,
  key: string,
  actions: Array<PermissionAction>,
) {
  permissions[key] = Array.from(
    new Set([...(permissions[key] ?? []), ...actions]),
  )
}

function mapActions(actions: Array<string>): Array<PermissionAction> {
  const rawActions = actions.map((action) => action.toLowerCase())

  const mapped: Array<PermissionAction> = []

  rawActions.forEach((action) => {
    if (action === 'list') mapped.push('index')
    if (action === 'read') {
      mapped.push('show')
      if (!rawActions.includes('list')) mapped.push('index')
    }
    if (action === 'create') mapped.push('store')
    if (action === 'update') mapped.push('update')
    if (action === 'delete') mapped.push('destroy')
    if (isPermissionAction(action)) mapped.push(action)
  })

  return Array.from(new Set(mapped))
}

function isPermissionAction(action: string): action is PermissionAction {
  return [
    'index',
    'show',
    'store',
    'list',
    'read',
    'create',
    'update',
    'delete',
    'destroy',
  ].includes(action)
}
