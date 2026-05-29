

export type Supervisor = {
  id: number
  role: {name:string, id:number}
  name: string
  email: string
  phone_code: string
  phone: string
  avatar: string | null
  user_type: 'supervisor'
  is_active: boolean
  is_verified: boolean | null
  is_banned: boolean
  is_suspended: boolean
  settings: {
    language: string
    allow_notifications: boolean
  }
  location: { lat: number; lng: number }
  created_at?: string
}