import type {
  PermissionAction,
  UserAuth,
  UserPermissions,
} from '@/stores/authStore'

type RawPermission =
  | string
  | {
      title?: string
      action?: string
      name?: string
    }

type RawPermissions = Record<string, RawPermission[]>

export interface DashboardApiUser {
  id: string | number
  name?: string | null
  email?: string | null
  phone?: string | null
  role?: {
    id: string | number
    name?: string | null
    permissions?: RawPermissions
  } | null
  userType?: string | null
  user_type?: string | null
  isActive?: boolean
  is_active?: boolean
  isEmailVerified?: boolean
  is_email_verified?: boolean
  isPhoneVerified?: boolean
  is_phone_verified?: boolean
}

export interface DashboardAuthResponse {
  access_token?: string
  accessToken?: string
  user?: DashboardApiUser
}

export function unwrapApiData<T>(payload: any): T {
  return (payload?.data ?? payload) as T
}

export function getAccessTokenUserType(accessToken?: string | null) {
  try {
    const payload = accessToken?.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded.userType === 'string' ? decoded.userType : null
  } catch {
    return null
  }
}

export function isDashboardUser(user?: Pick<UserAuth, 'user_type'> | null) {
  return user?.user_type === 'admin' || user?.user_type === 'super_admin'
}

export function mapDashboardAuthResponse(response: DashboardAuthResponse): UserAuth {
  const token = response.access_token ?? response.accessToken ?? ''
  if (!response.user || !token) {
    throw new Error('Invalid dashboard auth response')
  }

  return mapDashboardUser(response.user, token)
}

export function mapDashboardUser(apiUser: DashboardApiUser, token: string): UserAuth {
  const roleName = apiUser.role?.name ?? ''
  const apiUserType = apiUser.user_type ?? apiUser.userType
  const permissions = normalizePermissions(apiUser.role?.permissions ?? {})

  return {
    id: Number(apiUser.id),
    name: apiUser.name ?? '',
    email: apiUser.email ?? '',
    phone_code: '',
    phone: apiUser.phone ?? '',
    country: null,
    image: null,
    user_type:
      roleName === 'Super Admin'
        ? 'super_admin'
        : apiUserType === 'admin' || apiUserType === 'super_admin'
          ? apiUserType
          : roleName
            ? 'admin'
            : 'user',
    is_active: apiUser.is_active ?? apiUser.isActive ?? true,
    is_verified: apiUser.is_email_verified ?? apiUser.isEmailVerified ?? null,
    is_banned: false,
    is_suspended: false,
    settings: {
      language: 'en',
      allow_notifications: true,
    },
    location: {
      lat: 0,
      lng: 0,
    },
    permissions,
    token,
    verification_token: null,
    role: apiUser.role
      ? {
          id: Number(apiUser.role.id),
          name: roleName,
        }
      : undefined,
  }
}

function normalizePermissions(rawPermissions: RawPermissions): UserPermissions {
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
  actions: PermissionAction[],
) {
  permissions[key] = Array.from(new Set([...(permissions[key] ?? []), ...actions]))
}

function mapActions(actions: RawPermission[]): PermissionAction[] {
  const rawActions = actions
    .map((action) => normalizeAction(action))
    .filter((action): action is string => !!action)

  const mapped: PermissionAction[] = []

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

function normalizeAction(action: RawPermission) {
  if (typeof action === 'string') return action

  const value = action.action ?? action.name ?? action.title
  if (!value) return null

  const lower = value.toLowerCase()
  if (lower.startsWith('list ')) return 'list'
  if (lower.startsWith('read ') || lower.startsWith('view ')) return 'read'
  if (lower.startsWith('create ')) return 'create'
  if (lower.startsWith('update ') || lower.startsWith('edit ')) return 'update'
  if (lower.startsWith('delete ')) return 'delete'

  return lower
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
