"use client"

import {
  Alert02Icon,
  Exchange01Icon,
  InformationCircleIcon,
  Notification01Icon,
  PackageIcon,
  Ticket01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link, useRouter } from "@/i18n/navigation"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Stagger } from "@ecommerce/ui/components/motion"
import { useTranslations } from "next-intl"
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton"
import {
  notificationHref,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type Notification,
} from "@/hooks/api/use-notifications"

function notificationStatus(notification: Notification) {
  const status =
    notification.data?.status ??
    notification.data?.new_status ??
    notification.data?.newStatus

  return typeof status === "string" ? status.replaceAll("_", " ") : null
}

function notificationIcon(notification: Notification) {
  const type = notification.type.toLowerCase()
  const entity = notification.entity?.type?.toLowerCase()

  if (type.includes("ticket") || entity === "ticket") return Ticket01Icon
  if (type.includes("return") || type.includes("exchange") || entity === "return" || entity === "exchange") return Exchange01Icon
  if (type.includes("payment") || entity === "payment" || entity === "wallet" || entity === "withdrawal") return Wallet01Icon
  if (type.includes("order") || entity === "order") return PackageIcon
  if (type.includes("error") || type.includes("failed")) return Alert02Icon
  return InformationCircleIcon
}

function NotificationRow({ notification }: { notification: Notification }) {
  const t = useTranslations("Notifications")
  const router = useRouter()
  const markRead = useMarkNotificationRead()
  const href = notificationHref(notification)
  const status = notificationStatus(notification)
  const isUnread = !notification.read_at
  const Icon = notificationIcon(notification)

  const open = () => {
    if (!href) return

    if (isUnread) {
      markRead.mutate(
        { id: notification.id },
        { onSettled: () => router.push(href) }
      )
      return
    }

    router.push(href)
  }

  return (
    <article
      data-motion-item
      className={`group relative flex gap-3 rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${isUnread ? "border-primary/30 bg-primary/[0.04] shadow-primary/5" : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-border hover:shadow-md"}`}
    >
      <div className={`relative grid size-10 shrink-0 place-items-center rounded-xl ${isUnread ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"}`}>
        <HugeiconsIcon icon={Icon} className="size-5" strokeWidth={1.8} />
        {isUnread ? <span className="absolute -end-1 -top-1 size-2.5 rounded-full border-2 border-background bg-primary" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className={`truncate font-semibold ${isUnread ? "text-foreground" : "text-foreground/90"}`}>
              {href ? (
                <Link
                  href={href}
                  className="text-start hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-disabled={markRead.isPending}
                  onClick={(event) => {
                    event.preventDefault()
                    if (!markRead.isPending) open()
                  }}
                >
                  {notification.title}
                </Link>
              ) : (
                notification.title
              )}
            </h2>
            <p className="mt-1 line-clamp-2 min-w-0 text-sm leading-5 text-muted-foreground">{notification.body}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <time className="text-xs font-medium text-muted-foreground">
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(notification.created_at))}
            </time>
            {status && (
              <Badge variant={isUnread ? "default" : "secondary"} className="capitalize">
                {status}
              </Badge>
            )}
            <div className="basis-full flex items-center justify-between gap-2">
              {isUnread && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate({ id: notification.id })}
                >
                  {t("markAsRead")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function NotificationsPage() {
  const t = useTranslations("Notifications")
  const notifications = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()

  const items = notifications.data ?? []
  const hasUnread = items.some((notification) => !notification.read_at)

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate({})}
          >
            {t("markAllAsRead")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.isPending && <ProfilePageSkeleton variant="list" />}
        {!notifications.isPending && items.length === 0 && (
          <div className="grid place-items-center gap-2 p-12 text-center">
            <HugeiconsIcon
              icon={Notification01Icon}
              className="size-8 text-muted-foreground"
            />
            <p className="font-medium">{t("empty")}</p>
          </div>
        )}
        <Stagger className="flex flex-col gap-3" stagger={0.06}>
          {items.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </Stagger>
      </div>
    </section>
  )
}
