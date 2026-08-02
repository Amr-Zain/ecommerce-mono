"use client"

import { useTranslations } from "next-intl"

import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import {
  useAddToCart,
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/api/use-cart"

function AddToCartButton({
  productId,
  variantId,
  productName,
  price,
  oldPrice,
  className,
  available = true,
}: {
  productId: string
  variantId?: string
  productName: string
  price: number
  oldPrice?: number
  className?: string
  available?: boolean
}) {
  const t = useTranslations("Product")
  const addToCart = useAddToCart(productId)
  const cart = useCart()
  const removeItem = useRemoveCartItem()
  const updateItem = useUpdateCartItem()
  const submitting = React.useRef(false)
  const numericProductId = Number(productId)
  const numericVariantId = variantId ? Number(variantId) : undefined
  const canAdd =
    available &&
    Number.isSafeInteger(numericProductId) &&
    numericProductId > 0 &&
    (numericVariantId === undefined ||
      (Number.isSafeInteger(numericVariantId) && numericVariantId > 0))
  const cartItem = cart.data?.data.items.find(
    (item) =>
      item.productId === productId &&
      (!variantId || item.variantId === variantId)
  )

  const changeQuantity = (quantity: number) => {
    if (!cartItem || submitting.current) return
    submitting.current = true
    updateItem.mutate(
      {
        id: cartItem.id,
        quantity,
      },
      {
        onSettled: () => {
          submitting.current = false
        },
      }
    )
  }

  const deleteFromCart = () => {
    if (!cartItem || submitting.current) return
    submitting.current = true
    removeItem.mutate(
      { id: cartItem.id },
      {
        onSettled: () => {
          submitting.current = false
        },
      }
    )
  }

  if (cartItem) {
    const pending =
      updateItem.isPending || removeItem.isPending || addToCart.isPending

    return (
      <div
        className="flex h-10 w-full items-center gap-2"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <div className="flex h-full min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border bg-background px-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || cartItem.quantity <= 1}
            onClick={() => changeQuantity(cartItem.quantity - 1)}
          >
            <HugeiconsIcon icon={MinusSignIcon} className="size-3.5" />
          </Button>
          <span className="min-w-5 text-center text-sm font-semibold">
            {cartItem.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending || cartItem.quantity >= cartItem.stockQuantity}
            onClick={() => changeQuantity(cartItem.quantity + 1)}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </Button>
        </div>
        <Button
          type="button"
          variant="destructive"
          aria-label={t("removeFromCart", { name: productName })}
          disabled={pending}
          onClick={deleteFromCart}
          className="size-10 shrink-0"
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      className={className}
      disabled={!canAdd || addToCart.isPending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!canAdd || submitting.current) return

        submitting.current = true
        addToCart.mutate(
          {
            productId: numericProductId,
            variantId: numericVariantId,
            quantity: 1,
            _optimistic: { name: productName, price, oldPrice },
          },
          {
            onSettled: () => {
              submitting.current = false
            },
          }
        )
      }}
    >
      {addToCart.isPending
        ? t("adding")
        : available
          ? t("addToCart")
          : t("unavailable")}
      <HugeiconsIcon
        icon={ShoppingCart01Icon}
        className="size-4"
        strokeWidth={2}
      />
    </Button>
  )
}

export { AddToCartButton }
