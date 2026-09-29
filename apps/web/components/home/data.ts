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

export const community = [
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=360&q=85",
]


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
