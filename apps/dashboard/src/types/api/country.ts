import { Image } from "./general"

export interface Country {
  id: number
  short_name: string
  name: string
  flag: string | null
}


type LocaleBlock = {
  name: string
  short_name: string
  currency_code: string
  nationality: string
}

export type CountryDetails = {
  id: number
  name: string
  short_name: string
  phone_code: string
  phone_length: number | null
  currency_code: string
  shipping_price: string
  nationality: string
  flag: Image | null
  is_active: boolean
  created_at: string
  phone_start_with: number
  en: LocaleBlock
  ar: LocaleBlock
}
export interface Location {
  lat: number
  lng: number
  location: any
}

export interface City {
  id: number
  name: string
  slug: string
  country: Country
  location: Location
  postal_code: string
  short_cut: string
  is_active: boolean
  created_at: string
}
