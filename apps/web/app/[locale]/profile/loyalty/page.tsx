"use client"

import { useTranslations } from "next-intl"
import { Award01Icon, GiftIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useLoyalty } from "@/hooks/api/use-loyalty"
import { Badge } from "@ecommerce/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"

function formatDate(value?: string | null) {
  if (!value) return ""
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
}

export default function LoyaltyPage() {
  const t = useTranslations("Loyalty")
  const loyalty = useLoyalty()

  if (loyalty.isPending) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-muted/40" />
  }

  if (!loyalty.data) {
    return <p className="text-sm text-muted-foreground">{t("notAvailable")}</p>
  }

  const { account, next_tier, rewards, transactions } = loyalty.data
  const tier = account.current_tier
  const nextTarget = next_tier?.min_lifetime_points ?? account.lifetime_points
  const previousTarget = tier?.min_lifetime_points ?? 0
  const progressSpan = Math.max(1, nextTarget - previousTarget)
  const progress = next_tier
    ? Math.min(100, Math.max(0, ((account.lifetime_points - previousTarget) / progressSpan) * 100))
    : 100

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Loyalty</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your points, tier progress, rewards, and recent activity.
          </p>
        </div>
        {tier && (
          <Badge className="text-sm" style={tier.color ? { backgroundColor: tier.color, color: "#111" } : undefined}>
            {tier.name} {tier.multiplier}x
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Available points" value={account.available_points} />
        <Metric label="Pending points" value={account.pending_points} />
        <Metric label="Lifetime points" value={account.lifetime_points} />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HugeiconsIcon icon={Award01Icon} className="size-5" />
            Tier Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
            <span>{tier?.name ?? "Bronze"}</span>
            <span>
              {next_tier
                ? `${Math.max(0, next_tier.min_lifetime_points - account.lifetime_points)} points to ${next_tier.name}`
                : "Top tier reached"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={GiftIcon} className="size-5" />
              Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{reward.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  <Badge variant="secondary">{reward.points_required} pts</Badge>
                </div>
              </div>
            ))}
            {rewards.length === 0 && <p className="text-sm text-muted-foreground">No rewards are available yet.</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(transactions.items ?? []).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <div>
                  <p className="font-semibold capitalize">{transaction.type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.description || formatDate(transaction.created_at)}
                  </p>
                </div>
                <Badge variant={transaction.direction === "credit" ? "default" : "secondary"}>
                  {transaction.direction === "credit" ? "+" : "-"}{transaction.points}
                </Badge>
              </div>
            ))}
            {(!transactions.items || transactions.items.length === 0) && (
              <p className="text-sm text-muted-foreground">No points activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  )
}
