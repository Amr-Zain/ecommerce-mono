"use client"

import { useTranslations } from "next-intl"

import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import { IconButton } from "@/components/home/icon-button"
import { useToggleWishlist, useWishlist } from "@/hooks/api/use-wishlist"
import { cn } from "@/lib/utils"

function WishlistButton({
  productId,
  productName,
  className,
  iconClassName,
}: {
  productId: string
  productName: string
  className?: string
  iconClassName?: string
}) {
  const t = useTranslations("Product")
  const wishlist = useWishlist()
  const toggleWishlist = useToggleWishlist(productId)
  const submitting = React.useRef(false)
  const numericProductId = Number(productId)
  const canToggle =
    Number.isSafeInteger(numericProductId) && numericProductId > 0
  const favored =
    wishlist.data?.data.some((item) => item.productId === productId) ?? false

  return (
    <IconButton
      label={`${favored ? t("remove") : t("save")} ${productName}`}
      className={cn(
        className,
        "disabled:pointer-events-none disabled:cursor-default disabled:opacity-100",
        favored && "text-destructive"
      )}
      disabled={!canToggle || toggleWishlist.isPending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!canToggle || submitting.current) return

        submitting.current = true
        toggleWishlist.mutate(
          {
            productId: numericProductId,
            _optimistic: { name: productName },
          },
          {
            onSettled: () => {
              submitting.current = false
            },
          }
        )
      }}
    >
      <HugeiconsIcon
        icon={FavouriteIcon}
        strokeWidth={2}
        className={cn(
          iconClassName,
          favored && "fill-current [&_path]:fill-current"
        )}
      />
    </IconButton>
  )
}

export { WishlistButton }
