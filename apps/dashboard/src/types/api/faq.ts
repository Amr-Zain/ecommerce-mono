export type Faq = {
  id: string
  sort_order?: number
  is_active: boolean
  created_at: string
  updated_at?: string
  record_id?: string
  // Current-locale values returned at root level
  question?: string
  answer?: string
  type?: string
  en?: { id?: string; record_id?: string; question?: string; answer?: string }
  ar?: { id?: string; record_id?: string; question?: string; answer?: string }
}

export const FAQ_TYPE_OPTIONS = [
  { value: '1', label: 'General' },
  { value: '2', label: 'Orders_and_payment' },
  { value: '3', label: 'Shipping_and_delivery' },
  { value: '4', label: 'Returns_and_exchanges' },
  { value: '5', label: 'Products' },
  { value: '6', label: 'Account_and_support' },
] as const

export const displayFaqType = (apiType: string) =>
  apiType.replace(/And/g, ' & ').replace(/_/g, ' ')

export type Category = {
  id: number
  name: string
  description: string
  image: string
  is_active: boolean
  sort_order: number
  created_at: string
  parent?: {
    id: number
    name: string
    image: string
    en?: { name: string }
    ar?: { name: string }
  } | null
  children?: {
    id: number
    name: string
    en?: { name: string }
    ar?: { name: string }
  }[]
}
