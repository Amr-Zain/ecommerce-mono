"use client"

import * as React from "react"
import { AddressStep } from "@/components/cart/step-address"
import { CartEmpty } from "@/components/cart/cart-empty"
import { CartStepper } from "@/components/cart/cart-stepper"
import { CartStep } from "@/components/cart/step-cart"
import { PaymentStep } from "@/components/cart/step-payment"
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/api/use-cart"
import { useGuestSession } from "@/components/auth/guest-session-provider"
import {
  useAddresses,
  useCheckoutPreview,
  usePlaceOrder,
  type CheckoutPreview,
  type PlaceOrderResult,
} from "@/hooks/api/use-checkout"

export type Step = "cart" | "address" | "payment"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=300&q=80"

export default function CartPage() {
  const [step, setStep] = React.useState<Step>("cart")
  const [couponCode, setCouponCode] = React.useState("")
  const [appliedCoupon, setAppliedCoupon] = React.useState("")
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>()
  const [preview, setPreview] = React.useState<CheckoutPreview>()
  const [orderResult, setOrderResult] = React.useState<PlaceOrderResult>()
  const guestSession = useGuestSession()
  const cart = useCart()
  const addresses = useAddresses()
  const checkoutPreview = useCheckoutPreview()
  const placeOrder = usePlaceOrder()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const items =
    cart.data?.data.items.map((item) => ({
      id: item.id,
      name: item.productName,
      brand: "Shopix",
      price: item.price,
      oldPrice: item.compareAtPrice ?? item.originalPrice,
      image: item.image ?? FALLBACK_IMAGE,
      qty: item.quantity,
      size: item.attributes[0]?.value ?? "",
      color: item.attributes[1]?.value ?? "",
    })) ?? []

  const subtotal = cart.data?.data.subtotal ?? 0
  const savings = items.reduce(
    (sum, item) => sum + Math.max(0, item.oldPrice - item.price) * item.qty,
    0
  )
  const totals = preview?.totals
  const pricing = {
    subtotal: totals?.subtotal ?? subtotal,
    savings,
    shipping: totals?.shipping_fee ?? 0,
    discount: totals?.discount_amount ?? 0,
    vat: totals?.vat_amount ?? 0,
    total: totals?.total_price ?? subtotal,
  }

  const effectiveAddressId =
    selectedAddressId ??
    addresses.data?.find((address) => address.is_default)?.id ??
    addresses.data?.[0]?.id ??
    ""

  const loadPreview = (
    addressId: string,
    coupon = appliedCoupon,
    onSuccess?: () => void
  ) => {
    if (!addressId) return
    checkoutPreview.mutate(
      {
        addressId: Number(addressId),
        couponCode: coupon || undefined,
      },
      {
        onSuccess: (response) => {
          setPreview(response.data)
          onSuccess?.()
        },
      }
    )
  }

  const applyCoupon = () => {
    const code = couponCode.trim()
    if (!code) return
    if (!effectiveAddressId) {
      setAppliedCoupon(code)
      setStep("address")
      return
    }
    checkoutPreview.mutate(
      { addressId: Number(effectiveAddressId), couponCode: code },
      {
        onSuccess: (response) => {
          setAppliedCoupon(code)
          setPreview(response.data)
        },
      }
    )
  }

  const selectAddress = (id: string) => {
    setSelectedAddressId(id)
    loadPreview(id)
  }

  const submitOrder = (
    paymentMethod: "cod" | "bank_transfer" | "stripe_checkout",
    notes?: string
  ) => {
    placeOrder.mutate(
      {
        addressId: Number(effectiveAddressId),
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        notes,
      },
      {
        onSuccess: (response) => {
          const result = response.data
          if (result.redirect_url) {
            window.location.assign(result.redirect_url)
            return
          }
          setOrderResult(result)
        },
      }
    )
  }

  if (guestSession === "loading" || cart.isPending) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading cart...
      </div>
    )
  }

  if (guestSession === "error" || cart.isError) {
    return (
      <div className="py-20 text-center text-destructive">
        Unable to load cart. Please refresh after the guest session is ready.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {orderResult ? (
          <PaymentStep
            pricing={pricing}
            isLoading={placeOrder.isPending}
            result={orderResult}
            onBack={() => setStep("address")}
            onPlaceOrder={submitOrder}
          />
        ) : items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="space-y-8">
            <CartStepper currentStep={step} />
            {step === "cart" && (
              <CartStep
                items={items}
                pricing={pricing}
                onNext={() => setStep("address")}
                couponCode={couponCode}
                couponApplied={Boolean(appliedCoupon)}
                couponPending={checkoutPreview.isPending}
                onCouponChange={(code) => {
                  setCouponCode(code)
                  if (code.trim() !== appliedCoupon) {
                    setAppliedCoupon("")
                    setPreview(undefined)
                  }
                }}
                onApplyCoupon={applyCoupon}
                onQuantityChange={(id, quantity) =>
                  updateItem.mutate({
                    _endpoint: `/api/client/cart/items/${id}`,
                    quantity,
                  })
                }
                onRemove={(id) =>
                  removeItem.mutate({
                    _endpoint: `/api/client/cart/items/${id}`,
                  })
                }
              />
            )}
            {step === "address" && (
              <AddressStep
                pricing={pricing}
                selectedId={effectiveAddressId}
                previewPending={checkoutPreview.isPending}
                onBack={() => setStep("cart")}
                onSelect={selectAddress}
                onNext={() =>
                  loadPreview(effectiveAddressId, appliedCoupon, () =>
                    setStep("payment")
                  )
                }
              />
            )}
            {step === "payment" && (
              <PaymentStep
                pricing={pricing}
                isLoading={placeOrder.isPending}
                result={orderResult}
                onBack={() => setStep("address")}
                onPlaceOrder={submitOrder}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
