"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
  TicketIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ecommerce/ui/components/select"
import { Separator } from "@ecommerce/ui/components/separator"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type CartItem = {
  id: string
  name: string
  brand: string
  price: number
  oldPrice: number
  image: string
  qty: number
  stock: number
  attributes: Array<{ name: string; value: string }>
  variantId: string
  variantOptions: Array<{
    id: string
    price: number
    compareAtPrice?: number
    stockQuantity: number
    available: boolean
    isDefault: boolean
    attributes: Array<{ name: string; value: string }>
  }>
}

function formatVariantOptionLabel(option: CartItem["variantOptions"][number]) {
  const attributes = option.attributes
    .map((attribute) => `${attribute.name}: ${attribute.value}`)
    .join(" / ")
  const label =
    attributes ||
    (option.isDefault ? "Default variant" : `Variant #${option.id}`)

  return `${label} - $${option.price.toFixed(2)}${!option.available ? " (out of stock)" : ""}`
}

function CartQuantityControl({
  item,
  onQuantityChange,
}: {
  item: CartItem
  onQuantityChange: (id: string, quantity: number) => void
}) {
  const t = useTranslations("Cart")
  const [inputValue, setInputValue] = React.useState(String(item.qty))
  const maxQuantity = Math.max(1, item.stock)

  React.useEffect(() => {
    setInputValue(String(item.qty))
  }, [item.id, item.qty])

  const commitValue = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    const quantity = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 1), maxQuantity)
      : item.qty

    setInputValue(String(quantity))
    if (quantity !== item.qty) onQuantityChange(item.id, quantity)
  }

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
      <button
        type="button"
        onClick={() => commitValue(String(item.qty - 1))}
        disabled={item.qty <= 1}
        className="flex size-6 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("decreaseQuantity")}
      >
        <HugeiconsIcon
          icon={MinusSignIcon}
          className="size-3"
          strokeWidth={2.5}
        />
      </button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        dir="ltr"
        value={inputValue}
        onChange={(event) => {
          const value = event.target.value
          if (/^\d*$/.test(value)) setInputValue(value)
        }}
        onBlur={(event) => commitValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") {
            setInputValue(String(item.qty))
            event.currentTarget.blur()
          }
        }}
        aria-label={`${item.name} quantity`}
        className="h-6 w-8 border-0 px-0 text-center text-sm font-bold shadow-none focus-visible:ring-0"
        min={1}
        max={maxQuantity}
      />
      <button
        type="button"
        onClick={() => commitValue(String(item.qty + 1))}
        disabled={item.qty >= maxQuantity}
        className="flex size-6 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("increaseQuantity")}
      >
        <HugeiconsIcon
          icon={PlusSignIcon}
          className="size-3"
          strokeWidth={2.5}
        />
      </button>
    </div>
  )
}

export interface Pricing {
  subtotal: number
  savings: number
  shipping: number
  discount?: number
  couponCode?: string
  couponType?: string
  couponDiscount?: number
  loyaltyDiscount?: number
  vat?: number
  total: number
}

interface CartStepProps {
  items: CartItem[]
  pricing: Pricing
  onNext: () => void
  onQuantityChange: (id: string, quantity: number) => void
  onVariantChange: (id: string, variantId: string) => void
  onRemove: (id: string) => void
  couponCode: string
  couponApplied: boolean
  couponPending: boolean
  onCouponChange: (code: string) => void
  onApplyCoupon: () => void
}

export function PricingSummary({
  pricing,
  onNext,
  actionLabel,
  disabled,
}: {
  pricing: Pricing
  onNext: () => void
  actionLabel?: string
  disabled?: boolean
}) {
  const t = useTranslations("Cart")
  const couponDiscount = Math.max(
    0,
    pricing.couponDiscount ?? pricing.discount ?? 0
  )
  const loyaltyDiscount = Math.max(0, pricing.loyaltyDiscount ?? 0)
  const hasCoupon = Boolean(pricing.couponCode)
  const isFreeShippingCoupon =
    pricing.couponType?.toLowerCase().replaceAll("_", "") === "freeshipping"

  return (
    <div className="sticky top-40 space-y-4 rounded-2xl border bg-card p-6">
      <h3 className="text-base font-bold text-foreground">{t("orderSummary")}</h3>
      <Separator />
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="font-semibold">${pricing.subtotal.toFixed(2)}</span>
        </div>
        {hasCoupon && (
          <div className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-xs text-success">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">
                {t("couponApplied", { code: pricing.couponCode ?? "" })}
              </span>
              <span>{isFreeShippingCoupon ? t("freeShipping") : t("active")}</span>
            </div>
          </div>
        )}
        {(hasCoupon || couponDiscount > 0) && (
          <div className="flex justify-between text-success">
            <span>{hasCoupon ? t("couponDiscount") : t("discount")}</span>
            <span className="font-semibold">
              {couponDiscount > 0
                ? `- $${couponDiscount.toFixed(2)}`
                : isFreeShippingCoupon
                  ? t("freeShipping")
                  : t("applied")}
            </span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-success">
            <span>{t("loyaltyDiscount")}</span>
            <span className="font-semibold">
              - ${loyaltyDiscount.toFixed(2)}
            </span>
          </div>
        )}
        {(pricing.vat ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("vat")}</span>
            <span className="font-semibold">${pricing.vat!.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-success">
          <span>{t("yourSavings")}</span>
          <span className="font-semibold">- ${pricing.savings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span
            className={cn(
              "font-semibold",
              pricing.shipping === 0 && "text-success"
            )}
          >
            {pricing.shipping === 0
              ? t("free")
              : `$${pricing.shipping.toFixed(2)}`}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between text-base font-bold">
        <span>{t("total")}</span>
        <span>${pricing.total.toFixed(2)}</span>
      </div>
      <Button
        onClick={onNext}
        disabled={disabled}
        className="h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {actionLabel ?? t("proceedToCheckout")}
      </Button>
    </div>
  )
}

export function CartStep({
  items,
  pricing,
  onNext,
  onQuantityChange,
  onVariantChange,
  onRemove,
  couponCode,
  couponApplied,
  couponPending,
  onCouponChange,
  onApplyCoupon,
}: CartStepProps) {
  const t = useTranslations("Cart")

  const removeItem = (id: string) => {
    onRemove(id)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Items List */}
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => {
          const selectedOption = item.variantOptions.find(
            (option) => option.id === item.variantId
          )
          const selectedVariantLabel = selectedOption
            ? formatVariantOptionLabel(selectedOption)
            : "Choose variant"

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border bg-card p-4 sm:p-5"
            >
              {/* Image */}
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted/40 sm:size-28">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                      {item.brand}
                    </p>
                    <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug font-bold text-foreground">
                      {item.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
                      {item.attributes.map((attribute) => (
                        <span key={`${attribute.name}-${attribute.value}`}>
                          {attribute.name}: {attribute.value}
                        </span>
                      ))}
                    </div>
                    {item.variantOptions.length > 1 ? (
                      <div className="mt-3 w-full space-y-1">
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Variant
                        </p>
                        <Select
                          value={item.variantId}
                          onValueChange={(value) => {
                            if (value) onVariantChange(item.id, value)
                          }}
                        >
                          <SelectTrigger className="h-9 w-full bg-background text-xs">
                            <SelectValue placeholder={selectedVariantLabel}>
                              {selectedVariantLabel}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            alignItemWithTrigger={false}
                            className="w-[min(28rem,calc(100vw-2rem))] p-2 text-xs"
                          >
                            {item.variantOptions.map((option) => {
                              return (
                                <SelectItem
                                  key={option.id}
                                  value={option.id}
                                  disabled={!option.available}
                                  className="items-start py-2 ps-2 pe-9 leading-relaxed *:[span]:last:break-words *:[span]:last:whitespace-normal"
                                >
                                  {formatVariantOptionLabel(option)}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${item.oldPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Qty Controls */}
                  <CartQuantityControl
                    item={item}
                    onQuantityChange={onQuantityChange}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Coupon */}
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <HugeiconsIcon
              icon={TicketIcon}
              className="size-4 text-muted-foreground"
              strokeWidth={2}
            />
            {t("applyCoupon")}
          </p>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              placeholder={t("couponPlaceholder")}
              className="h-10 flex-1 rounded-xl text-sm"
            />
            <Button
              variant="outline"
              className="h-10 rounded-xl px-5 text-sm font-bold"
              disabled={!couponCode.trim() || couponPending}
              onClick={onApplyCoupon}
            >
              {couponPending
                ? t("checking")
                : couponApplied
                  ? t("applied")
                  : t("apply")}
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="lg:col-span-1">
        <PricingSummary pricing={pricing} onNext={onNext} />
      </div>
    </div>
  )
}

// PricingSummary and Pricing are exported above
