"use client"

import { CreditCardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import type { PaymentMethodOption } from "@/hooks/api/use-checkout"
import { cn } from "@/lib/utils"

type PaymentMethodLogoProps = {
  method?: PaymentMethodOption | null
  src?: string | null
  alt?: string | null
  className?: string
  imageClassName?: string
}

function PaymentMethodLogo({
  method,
  src,
  alt,
  className,
  imageClassName,
}: PaymentMethodLogoProps) {
  const image =
    src ||
    method?.logo_url ||
    method?.provider_logo_url ||
    method?.icon_url ||
    method?.method_icon_url

  return (
    <span
      className={cn(
        "flex w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={
            alt || method?.provider_name || method?.label || "Payment method"
          }
          width={96}
          height={48}
          className={cn("h-full w-full object-contain", imageClassName)}
          unoptimized
        />
      ) : (
        <HugeiconsIcon
          icon={CreditCardIcon}
          className="size-5 text-muted-foreground"
        />
      )}
    </span>
  )
}

export { PaymentMethodLogo }
