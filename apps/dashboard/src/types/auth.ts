import type { Image } from '@/types/api/general'

export interface UserLocation {
  lat: number
  lng: number
}

export interface UserSettings {
  language: 'ar' | 'en'
  allow_notifications: boolean
  market?: string
}

export type PermissionAction =
  | 'index'
  | 'show'
  | 'store'
  | 'list'
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'destroy'

export type UserPermissions = Record<string, Array<PermissionAction>>

export interface UserCountry {
  id: number
  name: string
  code: string
  flag: {
    id: number
    hash: string
    mime_type: string
    url: string
  } | null
  phone_length: number
  phone_starting_number: number
}

export interface Tier {
  id: string
  name: string
  multiplier: number
  min_lifetime_points: number
  color: string
}

export interface DashboardLoyalty {
  available_points: number
  pending_points: number
  lifetime_points: number
  tier: Tier | null
}

export interface DashboardUser {
  id: number
  session_id?: string
  role?: {
    id: number
    name: string
  }
  name: string
  email: string
  phone_code: string
  phone: string
  gender?: 'male' | 'female' | string | null
  birth_date?: string | null
  country: UserCountry | null
  image: Image | null
  user_type: 'super_admin' | 'admin' | 'user' | string
  is_active: boolean
  is_email_verified: boolean
  is_phone_verified: boolean
  is_banned: boolean
  is_suspended: boolean
  settings: UserSettings
  location: UserLocation
  addresses?: Array<Record<string, unknown>>
  tier?: Tier | null
  loyalty?: DashboardLoyalty
  permissions: UserPermissions
}

export interface DashboardSession {
  accessToken: string
  user: DashboardUser
}
