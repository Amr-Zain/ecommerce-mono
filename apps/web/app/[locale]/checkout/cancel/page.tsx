import Link from "next/link"

import { Button } from "@ecommerce/ui/components/button"

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-black">Payment Cancelled</h1>
        <p className="text-sm text-muted-foreground">
          Your order was not created. Reserved stock will be released by the
          backend.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" render={<Link href="/cart" />}>
          Return to Cart
        </Button>
        <Button render={<Link href="/collections" />}>Continue Shopping</Button>
      </div>
    </div>
  )
}
