"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons"

export function CartEmpty() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Empty className="py-24 max-w-md mx-auto border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-20 rounded-3xl bg-muted/50 mb-6 text-muted-foreground">
              <HugeiconsIcon icon={ShoppingCart01Icon} className="size-10" strokeWidth={1.5} />
            </EmptyMedia>
          <EmptyTitle className="text-2xl font-bold">Your cart is empty</EmptyTitle>
          <EmptyDescription className="text-sm text-muted-foreground max-w-xs">
            Looks like you haven't added anything to your cart yet. Explore our collections and find something you'll love!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-6">
          <Button className="rounded-xl px-8 h-12 text-sm font-bold bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Link href={ROUTES.collections.root}>Start Shopping</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
