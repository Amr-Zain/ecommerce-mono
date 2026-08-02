"use client"

import { useTranslations } from "next-intl"
import { CheckmarkCircle01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import { useVerifyCheckoutPayment } from "@/hooks/api/use-checkout"

function CheckoutSuccessContent() {
  const t = useTranslations("Checkout")
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get("checkout_id")
  const verify = useVerifyCheckoutPayment()
  const started = React.useRef(false)

  const verifyPayment = React.useCallback(() => {
    if (!checkoutId || verify.isPending) return
    verify.mutate({ checkoutId })
  }, [checkoutId, verify])

  React.useEffect(() => {
    if (started.current || !checkoutId) return
    started.current = true
    verify.mutate({ checkoutId })
  }, [checkoutId, verify])

  const result = verify.data?.data
  const completed = Boolean(result?.received || result?.order_number)

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-success/10 text-success">
        <HugeiconsIcon
          icon={completed ? CheckmarkCircle01Icon : Loading03Icon}
          className={completed ? "size-10" : "size-10 animate-spin"}
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black">
          {completed ? t("paymentConfirmed") : t("paymentReceived")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {completed
            ? t("orderCreated")
            : t("confirmingPayment")}
        </p>
      </div>
      {result?.order_number && (
        <div className="w-full rounded-2xl border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">{t("orderNumber")}</p>
          <p className="font-black">{result.order_number}</p>
        </div>
      )}
      {!completed && checkoutId && (
        <Button onClick={verifyPayment} disabled={verify.isPending}>
          {verify.isPending ? t("checking") : t("refreshPaymentStatus")}
        </Button>
      )}
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href={ROUTES.profile.orders.root} />}>
          {t("myOrders")}
        </Button>
        <Button render={<Link href={ROUTES.collections.root} />}>{t("continueShopping")}</Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const t = useTranslations("Checkout")
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center text-muted-foreground">
          {t("loadingPaymentStatus")}
        </div>
      }
    >
      <CheckoutSuccessContent />
    </React.Suspense>
  )
}
