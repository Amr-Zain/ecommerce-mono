import type { Image } from '@/types/api/general'
import type {
  DashboardLoyalty,
  DashboardUser,
  Tier,
  UserSettings,
} from '@/types/auth'

export type DashboardApiPermissions = Record<string, Array<string>>

export interface DashboardApiRole {
  id: string
  name: string
  permissions: DashboardApiPermissions
}

/** Exact browser response user returned by POST /auth/login and /auth/refresh. */
export interface DashboardAuthUserResponse {
  id: string
  name: string
  email: string
  phone?: string
  user_type: string
  role?: DashboardApiRole
  is_email_verified: boolean
  is_phone_verified: boolean
}

/** Exact browser response returned by POST /auth/login and /auth/refresh. */
export interface DashboardAuthResponse {
  access_token: string
  session_id: string
  user: DashboardAuthUserResponse
}

/** Serialized data payload returned by GET /auth/me. */
export interface DashboardMeResponse {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: DashboardApiRole | null
  user_type: string | null
  is_email_verified: boolean
  is_phone_verified: boolean
  is_active: boolean
}

export interface DashboardProfileSettingsResponse
  extends Partial<UserSettings> {
  allow_notifications?: boolean
}

/** Serialized data payload returned by GET /client/profile and its update endpoints. */
export interface DashboardProfileResponse {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  phone_code: string | null
  user_type: string | null
  is_email_verified: boolean
  is_phone_verified: boolean
  is_active: boolean
  is_banned?: boolean
  is_suspended?: boolean
  gender?: string | null
  birth_date?: string | null
  avatar?: Image | null
  image?: Image | null
  settings?: DashboardProfileSettingsResponse
  location?: { lat?: number; lng?: number } | null
  country?: DashboardUser['country']
  addresses?: Array<Record<string, unknown>>
  tier?: Tier | null
  loyalty?: DashboardLoyalty
}

export interface DashboardUserApiShape {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  phone_code?: string | null
  user_type?: string | null
  role?: DashboardApiRole | null
  is_email_verified?: boolean
  is_phone_verified?: boolean
  is_active?: boolean
  is_banned?: boolean
  is_suspended?: boolean
  gender?: string | null
  birth_date?: string | null
  avatar?: Image | null
  image?: Image | null
  settings?: DashboardProfileSettingsResponse
  location?: { lat?: number; lng?: number } | null
  country?: DashboardUser['country']
  addresses?: Array<Record<string, unknown>>
  tier?: Tier | null
  loyalty?: DashboardLoyalty
}
