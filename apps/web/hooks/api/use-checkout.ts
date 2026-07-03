"use client"

import { useSession } from "next-auth/react"
import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { clientEndpoints } from "@/lib/client/client-api"

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
  loyalty?: {
    reward?: Record<string, unknown>
    points?: number
    discount_amount?: number
    discountAmount?: number
    available_points?: number
    pending_points?: number
  } | null
  wallet?: {
    available_balance?: number
    availableBalance?: number
    pending_balance?: number
    pendingBalance?: number
    requested_amount?: number
    requestedAmount?: number
    applied_amount?: number
    appliedAmount?: number
    remaining_amount?: number
    remainingAmount?: number
    can_cover_full_amount?: boolean
    canCoverFullAmount?: boolean
  }
  payment_breakdown?: {
    wallet_amount?: number
    walletAmount?: number
    external_amount?: number
    externalAmount?: number
    total_amount?: number
    totalAmount?: number
  }
  paymentBreakdown?: {
    walletAmount?: number
    externalAmount?: number
    totalAmount?: number
  }
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
  wallet_amount?: number
  walletAmount?: number
  external_amount?: number
  externalAmount?: number
  loyalty_reward_id?: string | null
  loyaltyRewardId?: string | null
  loyalty_points?: number
  loyaltyPoints?: number
  loyalty_discount_amount?: number
  loyaltyDiscountAmount?: number
}

type VerifyPaymentResult = {
  received?: boolean
  checkout_id?: string
  order_id?: string | null
  order_number?: string | null
  payment_status?: string
}

type PaymentMethodOption = {
  id: string
  label: string
  provider?: string | null
  provider_identifier?: string | null
  provider_name?: string | null
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
  walletAmount?: number
  rewardId?: number
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
  const { status } = useSession()
  return useFetch<unknown, Address[]>({
    authRequired: true,
    enabled: status === "authenticated",
    endpoint: clientEndpoints.addresses,
    queryKey: queryKeys.addresses(),
    select: responseItems<Address>,
  })
}

function useCountries() {
  return useFetch<unknown, Location[]>({
    endpoint: clientEndpoints.countries,
    queryKey: queryKeys.countries(),
    select: responseItems<Location>,
  })
}

function useCities(countryId?: string) {
  return useFetch<unknown, Location[]>({
    enabled: Boolean(countryId),
    endpoint: clientEndpoints.cities,
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
    authRequired: true,
    endpoint: clientEndpoints.addresses,
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
    authRequired: true,
    unauthorizedReturnTo: "/cart?step=address",
    endpoint: clientEndpoints.checkoutPreview,
    mutationKey: ["checkout", "preview"],
    method: "POST",
  })
}

function useCheckoutPaymentMethods() {
  return useFetch<unknown, PaymentMethodOption[]>({
    endpoint: clientEndpoints.checkoutPaymentMethods,
    queryKey: queryKeys.checkoutPaymentMethods(),
    select: (response) => {
      const data = (response as { data?: { payment_methods?: unknown } })?.data
      return Array.isArray(data?.payment_methods)
        ? (data.payment_methods as PaymentMethodOption[])
        : []
    },
  })
}

function usePlaceOrder() {
  return useMutate<{ success: boolean; data: PlaceOrderResult }, PlaceOrderInput>({
    authRequired: true,
    unauthorizedReturnTo: "/cart?step=address",
    endpoint: clientEndpoints.checkoutPlaceOrder,
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
    authRequired: true,
    unauthorizedReturnTo: "/cart?step=address",
    endpoint: clientEndpoints.checkoutVerifyPayment,
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
  useCheckoutPaymentMethods,
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
  PaymentMethodOption,
  VerifyPaymentResult,
}
