"use client"

import * as React from "react"
import { Login01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useSearchParams } from "next/navigation"
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
import { useSession } from "next-auth/react"
import { useRouter } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import {
  useAddresses,
  useCheckoutPaymentMethods,
  useCheckoutPreview,
  usePlaceOrder,
  type CheckoutPreview,
  type PlaceOrderResult,
} from "@/hooks/api/use-checkout"
import { useWallet } from "@/hooks/api/use-wallet"
import { useLoyalty } from "@/hooks/api/use-loyalty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Button } from "@ecommerce/ui/components/button"
import { Skeleton } from "@ecommerce/ui/components/skeleton"
import { Link } from "@/i18n/navigation"
import { loginPath } from "@/lib/return-path"
import { StatePanel } from "@/components/shared/state-panel"
import { useTranslations } from "next-intl"

export type Step = "cart" | "address" | "payment"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=300&q=80"

function isInsufficientLoyaltyPointsError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : ""
  return message.toLowerCase().includes("insufficient loyalty points")
}

function numberFrom(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export default function CartPage() {
  const t = useTranslations("Experience")
  const searchParams = useSearchParams()
  const requestedStep = searchParams.get("step")
  const step: Step =
    requestedStep === "address" || requestedStep === "payment"
      ? requestedStep
      : "cart"
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [couponCode, setCouponCode] = React.useState("")
  const [appliedCoupon, setAppliedCoupon] = React.useState("")
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>()
  const [selectedRewardId, setSelectedRewardId] = React.useState<string>()
  const [preview, setPreview] = React.useState<CheckoutPreview>()
  const [walletAmount, setWalletAmount] = React.useState(0)
  const [orderResult, setOrderResult] = React.useState<PlaceOrderResult>()
  const { status } = useSession()
  const router = useRouter()
  const cart = useCart()
  const addresses = useAddresses()
  const checkoutPreview = useCheckoutPreview()
  const paymentMethods = useCheckoutPaymentMethods()
  const placeOrder = usePlaceOrder()
  const wallet = useWallet()
  const loyalty = useLoyalty()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const isAuthenticated = status === "authenticated"
  const isAuthLoading = status === "loading"
  const setStep = React.useCallback(
    (nextStep: Step) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextStep === "cart") params.delete("step")
      else params.set("step", nextStep)
      router.replace(params.size ? `/cart?${params}` : "/cart")
    },
    [router, searchParams]
  )
  const requireLogin = () => setLoginOpen(true)
  const canUseCheckout = () => {
    if (isAuthenticated) return true
    if (!isAuthLoading) requireLogin()
    return false
  }

  const items =
    cart.data?.data.items.map((item) => ({
      id: item.id,
      name: item.productName,
      brand: "Ecommerce",
      price: item.price,
      oldPrice: item.compareAtPrice ?? item.originalPrice,
      image: item.image ?? FALLBACK_IMAGE,
      qty: item.quantity,
      stock: item.stockQuantity,
      attributes: item.attributes,
      variantId: item.variantId,
      variantOptions: item.variantOptions,
    })) ?? []

  const subtotal = cart.data?.data.subtotal ?? 0
  const savings = items.reduce(
    (sum, item) => sum + Math.max(0, item.oldPrice - item.price) * item.qty,
    0
  )
  const totals = preview?.totals
  const loyaltyDiscount = Number(
    preview?.loyalty?.discount_amount ?? preview?.loyalty?.discountAmount ?? 0
  )
  const totalDiscount = numberFrom(
    totals?.discount_amount,
    totals?.discountAmount
  )
  const couponDiscount = Math.max(0, totalDiscount - loyaltyDiscount)
  const previewCoupon = preview?.coupon
  const couponCodeForSummary = previewCoupon?.code ?? appliedCoupon
  const couponTypeForSummary =
    previewCoupon?.discount_type ?? previewCoupon?.discountType
  const redeemedPoints = Number(preview?.loyalty?.points ?? 0)
  const availableLoyaltyPoints = Number(
    loyalty.data?.account.available_points ??
      loyalty.data?.account.availablePoints ??
      0
  )
  const pricing = {
    subtotal: numberFrom(totals?.subtotal, subtotal),
    savings,
    shipping: numberFrom(totals?.shipping_fee, totals?.shippingFee),
    discount: totalDiscount,
    couponCode: couponCodeForSummary || undefined,
    couponType: couponTypeForSummary,
    couponDiscount,
    loyaltyDiscount,
    vat: numberFrom(totals?.vat_amount, totals?.vatAmount),
    total: numberFrom(totals?.total_price, totals?.totalPrice, subtotal),
  }
  const walletAvailable = Number(
    wallet.data?.available_balance ?? wallet.data?.availableBalance ?? 0
  )
  const walletPending = Number(
    wallet.data?.pending_balance ?? wallet.data?.pendingBalance ?? 0
  )
  const appliedWalletAmount = Math.min(
    Math.max(walletAmount, 0),
    walletAvailable,
    pricing.total
  )

  const effectiveAddressId =
    selectedAddressId ??
    addresses.data?.find((address) => address.is_default)?.id ??
    addresses.data?.[0]?.id ??
    ""

  const beginCheckout = () => {
    if (!canUseCheckout()) return
    setStep("address")
  }

  const loadPreview = (
    addressId: string,
    options: { coupon?: string; rewardId?: string; onSuccess?: () => void } = {}
  ) => {
    if (!canUseCheckout()) return
    if (!addressId) return
    const coupon = options.coupon ?? appliedCoupon
    const reward = options.rewardId ?? selectedRewardId
    checkoutPreview.mutate(
      {
        addressId: Number(addressId),
        couponCode: coupon || undefined,
        rewardId: reward ? Number(reward) : undefined,
      },
      {
        onSuccess: (response) => {
          setPreview(response.data)
          options.onSuccess?.()
        },
        onError: (error) => {
          if (reward && isInsufficientLoyaltyPointsError(error)) {
            setSelectedRewardId(undefined)
            loadPreview(addressId, {
              coupon,
              rewardId: undefined,
              onSuccess: options.onSuccess,
            })
          }
        },
      }
    )
  }

  const applyCoupon = () => {
    const code = couponCode.trim()
    if (!code) return
    if (!canUseCheckout()) return
    if (!effectiveAddressId) {
      setAppliedCoupon(code)
      setStep("address")
      return
    }
    loadPreview(effectiveAddressId, {
      coupon: code,
      rewardId: selectedRewardId,
      onSuccess: () => setAppliedCoupon(code),
    })
  }

  const selectAddress = (id: string) => {
    setSelectedAddressId(id)
    loadPreview(id)
  }

  const selectReward = (rewardId?: string) => {
    setSelectedRewardId(rewardId)
    if (effectiveAddressId) {
      loadPreview(effectiveAddressId, { coupon: appliedCoupon, rewardId })
    }
  }

  const submitOrder = (
    paymentMethod: string,
    notes?: string,
    requestedWalletAmount = appliedWalletAmount,
    providerIdentifier?: string
  ) => {
    if (!canUseCheckout()) return
    placeOrder.mutate(
      {
        addressId: Number(effectiveAddressId),
        paymentMethod,
        walletAmount:
          Math.min(
            Math.max(requestedWalletAmount, 0),
            walletAvailable,
            pricing.total
          ) > 0
            ? Math.min(
                Math.max(requestedWalletAmount, 0),
                walletAvailable,
                pricing.total
              )
            : undefined,
        couponCode: appliedCoupon || undefined,
        rewardId: selectedRewardId ? Number(selectedRewardId) : undefined,
        providerIdentifier,
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

  if (cart.isPending) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  if (cart.isError) {
    return (
      <StatePanel
        icon={<HugeiconsIcon icon={ShoppingCart01Icon} className="size-9" />}
        title={t("cartLoadTitle")}
        description={t("cartLoadDescription")}
        action={{ label: t("tryAgain"), onClick: () => void cart.refetch() }}
        secondaryHref={ROUTES.collections.root}
        secondaryLabel={t("continueShopping")}
      />
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
            walletAvailable={walletAvailable}
            walletPending={walletPending}
            walletAmount={appliedWalletAmount}
            rewards={loyalty.data?.rewards ?? []}
            availablePoints={availableLoyaltyPoints}
            selectedRewardId={selectedRewardId}
            loyaltyDiscount={loyaltyDiscount}
            redeemedPoints={redeemedPoints}
            onWalletAmountChange={setWalletAmount}
            onRewardChange={selectReward}
            onBack={() => setStep("address")}
            onPlaceOrder={submitOrder}
            availablePaymentMethods={paymentMethods.data ?? []}
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
                onNext={beginCheckout}
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
                    id,
                    quantity,
                  })
                }
                onVariantChange={(id, variantId) =>
                  updateItem.mutate({
                    id,
                    variantId: Number(variantId),
                  })
                }
                onRemove={(id) =>
                  removeItem.mutate({
                    id,
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
                  loadPreview(effectiveAddressId, {
                    coupon: appliedCoupon,
                    rewardId: selectedRewardId,
                    onSuccess: () => setStep("payment"),
                  })
                }
              />
            )}
            {step === "payment" && (
              <PaymentStep
                pricing={pricing}
                isLoading={placeOrder.isPending}
                result={orderResult}
                walletAvailable={walletAvailable}
                walletPending={walletPending}
                walletAmount={appliedWalletAmount}
                rewards={loyalty.data?.rewards ?? []}
                availablePoints={availableLoyaltyPoints}
                selectedRewardId={selectedRewardId}
                loyaltyDiscount={loyaltyDiscount}
                redeemedPoints={redeemedPoints}
                onWalletAmountChange={setWalletAmount}
                onRewardChange={selectReward}
                onBack={() => setStep("address")}
                onPlaceOrder={submitOrder}
                availablePaymentMethods={paymentMethods.data ?? []}
              />
            )}
            {(checkoutPreview.error || placeOrder.error) && (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {(checkoutPreview.error ?? placeOrder.error)?.message}
              </p>
            )}
          </div>
        )}
      </div>
      <Dialog open={loginOpen && !isAuthenticated} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={Login01Icon} className="size-6" />
            </div>
            <DialogTitle>{t("checkoutLoginTitle")}</DialogTitle>
            <DialogDescription>
              {t("checkoutLoginDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginOpen(false)}>
              {t("keepShopping")}
            </Button>
            <Button render={<Link href={loginPath("/cart?step=address")} />}>
              {t("signInContinue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
