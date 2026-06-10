"use client"

import { CheckmarkCircle01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import { useGuestSession } from "@/components/auth/guest-session-provider"
import { useVerifyCheckoutPayment } from "@/hooks/api/use-checkout"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get("checkout_id")
  const guestSession = useGuestSession()
  const verify = useVerifyCheckoutPayment()
  const started = React.useRef(false)

  const verifyPayment = React.useCallback(() => {
    if (!checkoutId || verify.isPending) return
    verify.mutate({ checkoutId })
  }, [checkoutId, verify])

  React.useEffect(() => {
    if (started.current || !checkoutId || guestSession !== "ready") return
    started.current = true
    verify.mutate({ checkoutId })
  }, [checkoutId, guestSession, verify])

  const result = verify.data?.data
  const completed = Boolean(result?.received || result?.order_number)

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <HugeiconsIcon
          icon={completed ? CheckmarkCircle01Icon : Loading03Icon}
          className={completed ? "size-10" : "size-10 animate-spin"}
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black">
          {completed ? "Payment Confirmed" : "Payment Received"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {completed
            ? "Your order has been created successfully."
            : "We are confirming your payment and preparing your order."}
        </p>
      </div>
      {result?.order_number && (
        <div className="w-full rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Order Number</p>
          <p className="font-black">{result.order_number}</p>
        </div>
      )}
      {!completed && checkoutId && (
        <Button onClick={verifyPayment} disabled={verify.isPending}>
          {verify.isPending ? "Checking..." : "Refresh Payment Status"}
        </Button>
      )}
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href="/profile/orders" />}>
          My Orders
        </Button>
        <Button render={<Link href="/collections" />}>Continue Shopping</Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-muted-foreground">
          Loading payment status...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </React.Suspense>
  )
}
