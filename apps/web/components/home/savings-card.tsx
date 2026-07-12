import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@ecommerce/ui/components/button"
import { Link } from "@/i18n/navigation"

export type Campaign = {
  title: string
  ctaLabel: string
  url: string
  expiresAt: string
  expiryLabel: string
}

export function SavingsCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="flex min-h-[350px] flex-col rounded-lg bg-primary p-6 text-primary-foreground">
      <h3 className="max-w-44 text-3xl leading-tight font-semibold">
        {campaign.title}
      </h3>
      <div className="mt-auto">
        {campaign.expiresAt ? (
          <p className="mb-2 text-xs font-medium">
            {campaign.expiryLabel}{" "}
            <time dateTime={campaign.expiresAt}>
              {campaign.expiresAt.replace("T", " ").slice(0, 16)}
            </time>
          </p>
        ) : null}
        <Button
          render={<Link href={campaign.url || "/products"} />}
          variant="secondary"
          className="mt-4 h-9 w-full rounded-full text-xs"
        >
          {campaign.ctaLabel}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Button>
      </div>
    </article>
  )
}
