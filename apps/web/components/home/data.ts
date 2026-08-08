import {
  CreditCardIcon,
  DeliveryReturn01Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

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
