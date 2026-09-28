import {
  CreditCardIcon,
  DeliveryReturn01Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type Category = {
  id: string
  name: string
  slug?: string
  image: string
  background?: string
}

export type Product = {
  id: string
  name: string
  brand?: string
  description?: string
  price: string
  oldPrice?: string
  badge?: string
  badgeTone?: "default" | "destructive"
  firstVariationId?: string
  image: string
  imageClassName?: string
}

export type Benefit = {
  icon: IconSvgElement
  titleKey: "freeDelivery" | "onlinePayment" | "easyReturns"
  copyKey:
    | "freeDeliveryDescription"
    | "onlinePaymentDescription"
    | "easyReturnsDescription"
}


export const benefits: Benefit[] = [
  {
    icon: DeliveryTruck01Icon,
    titleKey: "freeDelivery",
    copyKey: "freeDeliveryDescription",
  },
  {
    icon: CreditCardIcon,
    titleKey: "onlinePayment",
    copyKey: "onlinePaymentDescription",
  },
  {
    icon: DeliveryReturn01Icon,
    titleKey: "easyReturns",
    copyKey: "easyReturnsDescription",
  },
]
