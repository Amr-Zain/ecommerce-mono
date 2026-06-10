"use client"

import {
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
import { cn } from "@/lib/utils"

function AddToCartButton({
  productId,
  variantId,
  productName,
  price,
  oldPrice,
  className,
}: {
  productId: string
  variantId?: string
  productName: string
  price: number
  oldPrice?: number
  className?: string
}) {
  const addToCart = useAddToCart(productId)
  const cart = useCart()
  const removeItem = useRemoveCartItem()
  const updateItem = useUpdateCartItem()
  const submitting = React.useRef(false)
  const numericProductId = Number(productId)
  const numericVariantId = variantId ? Number(variantId) : undefined
  const canAdd =
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
    const mutation = quantity <= 0 ? removeItem : updateItem
    const variables =
      quantity <= 0
        ? { _endpoint: `/api/client/cart/items/${cartItem.id}` }
        : {
            _endpoint: `/api/client/cart/items/${cartItem.id}`,
            quantity,
          }

    mutation.mutate(variables as never, {
      onSettled: () => {
        submitting.current = false
      },
    })
  }

  if (cartItem) {
    const pending =
      updateItem.isPending || removeItem.isPending || addToCart.isPending

    return (
      <div
        className={cn(
          "flex h-9 items-center justify-between gap-2 rounded-lg border bg-background px-1",
          className
        )}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={pending}
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
          disabled={pending}
          onClick={() => changeQuantity(cartItem.quantity + 1)}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
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
      {addToCart.isPending ? "Adding..." : "Add to Cart"}
      <HugeiconsIcon
        icon={ShoppingCart01Icon}
        className="size-3.5"
        strokeWidth={2}
      />
    </Button>
  )
}

export { AddToCartButton }
