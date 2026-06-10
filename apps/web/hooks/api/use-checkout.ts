"use client"

import { useGuestSession } from "@/components/auth/guest-session-provider"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

type Translation = { name?: string }

type Address = {
  id: string
  address: string
  city_id?: string | null
  country_id?: string | null
  street_name?: string
  building_number?: string
  is_default?: boolean
  city?: { id: string; name?: string; translations?: Translation[] }
  country?: {
    id: string
    name?: string
    phone_code?: string
    translations?: Translation[]
  }
}

type Location = {
  id: string
  name?: string
  translations?: Translation[]
  country?: { id: string }
}

type CheckoutTotals = {
  subtotal: number
  shipping_fee: number
  discount_amount: number
  vat_amount: number
  total_price: number
}

type CheckoutPreview = {
  address: Record<string, unknown>
  coupon: {
    id: string
    code: string
    discount_type: string
    discount_value: number
  } | null
  totals: CheckoutTotals
}

type PlaceOrderResult = {
  id?: string
  checkout_id?: string
  order_number?: string | null
  total_price: number
  payment_method: string
  payment_status: string
  redirect_url?: string | null
  client_secret?: string | null
}

type VerifyPaymentResult = {
  received?: boolean
  checkout_id?: string
  order_id?: string | null
  order_number?: string | null
  payment_status?: string
}

type CreateAddressInput = {
  address: string
  cityId: number
  countryId: number
  streetName?: string
  buildingNumber?: string
  isDefault?: boolean
}

type CheckoutPreviewInput = {
  addressId: number
  couponCode?: string
}

type PlaceOrderInput = CheckoutPreviewInput & {
  paymentMethod: string
  notes?: string
}

function responseItems<T>(response: unknown): T[] {
  const data = (response as { data?: unknown })?.data
  if (Array.isArray(data)) return data as T[]

  const items = (data as { items?: unknown })?.items
  return Array.isArray(items) ? (items as T[]) : []
}

function useAddresses() {
  const guestSession = useGuestSession()
  return useFetch<unknown, Address[]>({
    enabled: guestSession === "ready",
    endpoint: "/api/client/profile/addresses",
    queryKey: queryKeys.addresses(),
    select: responseItems<Address>,
  })
}

function useCountries() {
  return useFetch<unknown, Location[]>({
    endpoint: "/api/client/countries",
    queryKey: queryKeys.countries(),
    select: responseItems<Location>,
  })
}

function useCities(countryId?: string) {
  return useFetch<unknown, Location[]>({
    enabled: Boolean(countryId),
    endpoint: "/api/client/cities",
    params: { countryId },
    queryKey: queryKeys.cities(countryId),
    select: (response) =>
      responseItems<Location>(response).filter(
        (city) => !city.country?.id || city.country.id === countryId
      ),
  })
}

function useCreateAddress() {
  return useMutate<unknown, CreateAddressInput>({
    endpoint: "/api/client/profile/addresses",
    mutationKey: ["addresses", "create"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.addresses()],
      },
    },
  })
}

function useCheckoutPreview() {
  return useMutate<{ success: boolean; data: CheckoutPreview }, CheckoutPreviewInput>({
    endpoint: "/api/client/checkout/preview",
    mutationKey: ["checkout", "preview"],
    method: "POST",
  })
}

function usePlaceOrder() {
  return useMutate<{ success: boolean; data: PlaceOrderResult }, PlaceOrderInput>({
    endpoint: "/api/client/checkout/place-order",
    mutationKey: ["checkout", "place-order"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
    },
  })
}

function useVerifyCheckoutPayment() {
  return useMutate<
    { success: boolean; data: VerifyPaymentResult },
    { checkoutId: string }
  >({
    endpoint: "/api/client/checkout/verify-payment",
    mutationKey: ["checkout", "verify-payment"],
    method: "POST",
    mutationOptions: {
      meta: {
        invalidates: [queryKeys.cart()],
      },
    },
  })
}

function locationName(location?: Location) {
  return location?.name ?? location?.translations?.[0]?.name ?? ""
}

export {
  locationName,
  useAddresses,
  useCheckoutPreview,
  useCities,
  useCountries,
  useCreateAddress,
  usePlaceOrder,
  useVerifyCheckoutPayment,
}
export type {
  Address,
  CheckoutPreview,
  CheckoutTotals,
  Location,
  PlaceOrderResult,
  VerifyPaymentResult,
}
