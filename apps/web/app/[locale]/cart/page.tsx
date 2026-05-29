"use client"

import * as React from "react"
import { CartStep } from "@/components/cart/step-cart"
import { AddressStep } from "@/components/cart/step-address"
import { PaymentStep } from "@/components/cart/step-payment"
import { CartEmpty } from "@/components/cart/cart-empty"
import { CartStepper } from "@/components/cart/cart-stepper"

export type Step = "cart" | "address" | "payment"

const MOCK_CART_ITEMS = [
  {
    id: "ci-1",
    name: "Samsung Galaxy A55 5G",
    brand: "Samsung",
    price: 349.00,
    oldPrice: 449.00,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80",
    qty: 1,
    size: "128GB",
    color: "Navy",
  },
  {
    id: "ci-2",
    name: "Noise ColorFit Pro 4",
    brand: "Noise",
    price: 225.00,
    oldPrice: 249.00,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=300&q=80",
    qty: 2,
    size: "One Size",
    color: "Black",
  },
]

export default function CartPage() {
  const [step, setStep] = React.useState<Step>("cart")
  const [items, setItems] = React.useState(MOCK_CART_ITEMS)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  const savings = items.reduce((acc, item) => acc + (item.oldPrice - item.price) * item.qty, 0)
  const shipping = subtotal > 300 ? 0 : 9.99
  const total = subtotal + shipping

  const pricing = { subtotal, savings, shipping, total }

  const isEmpty = items.length === 0

  const steps: Step[] = ["cart", "address", "payment"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {isEmpty ? (
          <CartEmpty />
        ) : (
          <div className="space-y-8">
            <CartStepper currentStep={step} />

            {step === "cart" && (
              <CartStep
                items={items}
                setItems={setItems}
                pricing={pricing}
                onNext={() => setStep("address")}
              />
            )}

            {step === "address" && (
              <AddressStep
                pricing={pricing}
                onBack={() => setStep("cart")}
                onNext={() => setStep("payment")}
              />
            )}

            {step === "payment" && (
              <PaymentStep
                pricing={pricing}
                onBack={() => setStep("address")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
