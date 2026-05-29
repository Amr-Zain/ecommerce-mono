export type ShowRoom = {
  id: number
  name: string
  address: string
  country: { id: number; name: string }
  city: { id: number; name: string }
  phone_code: string
  phone: string
  email: string | null
  url: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
  image?: string | null
}

export type ShowRoomShow = {
  id: number
  country_id: number
  city_id: number
  phone_code: string
  phone: string
  email: string | null
  url: string | null
  lat: number | null
  lng: number | null
  image?: string | null
  is_active: boolean
  translations?: {
    en?: { name?: string; address?: string }
    ar?: { name?: string; address?: string }
  }
  // some backends also return name/address flat:
  name?: string
  address?: string
}

export interface NamedRef {
  id: number
  name: string
}

 interface LocaleBlock {
  name: string
  address: string
}
export interface ShowRoomDetail {
  id: number
  name: string
  address: string
  country: NamedRef
  city: NamedRef
  phone_code: string
  phone: string
  email: string
  url: string
  lat: number
  lng: number
  is_active: boolean
  created_at: string
  en: LocaleBlock
  ar: LocaleBlock 
}