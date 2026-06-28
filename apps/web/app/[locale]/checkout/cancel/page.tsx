import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import { Button } from "@ecommerce/ui/components/button"

export default async function CheckoutCancelPage() {
  const t = await getTranslations("Checkout")
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-black">{t("paymentCancelled")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("cancelledDescription")}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href={ROUTES.cart} />}>
          {t("returnToCart")}
        </Button>
        <Button render={<Link href={ROUTES.collections.root} />}>{t("continueShopping")}</Button>
      </div>
    </div>
  )
}
