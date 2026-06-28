export type UserRole = "admin" | "user"

export type UserPermission = {
  id: string
  name: string
  route_name: string
}

export type UserSettings = {
  language: string
  allow_notifications: boolean
}

export type AuthUserFields = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  phone_code?: string | null
  role: UserRole
  accessToken?: string
  image?: string | null
  user_type?: string
  is_active?: boolean
  is_verified?: boolean
  is_banned?: boolean
  is_suspended?: boolean
  permissions?: UserPermission[]
  settings?: UserSettings
  tier?: {
    id: string
    name: string
    multiplier?: number
    min_lifetime_points?: number
    color?: string | null
  } | null
  loyalty?: {
    available_points: number
    pending_points: number
    lifetime_points: number
    tier?: AuthUserFields["tier"]
  }
}
