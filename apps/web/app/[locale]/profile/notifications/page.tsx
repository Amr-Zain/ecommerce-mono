"use client"

import { Notification01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "@/i18n/navigation"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
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

function NotificationRow({ notification }: { notification: Notification }) {
  const router = useRouter()
  const markRead = useMarkNotificationRead()
  const href = notificationHref(notification)
  const status = notificationStatus(notification)
  const isUnread = !notification.read_at

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
    <article className="flex gap-3 border-b p-4 last:border-b-0">
      <span
        className={`mt-2 size-2 shrink-0 rounded-full ${
          isUnread ? "bg-primary" : "bg-muted"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-medium">{notification.title}</h2>
            <p className="text-sm text-muted-foreground">
              {notification.body}
            </p>
          </div>
          {status && (
            <Badge variant="secondary" className="capitalize">
              {status}
            </Badge>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <time className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(notification.created_at))}
          </time>
          <div className="flex gap-2">
            {isUnread && (
              <Button
                size="sm"
                variant="ghost"
                disabled={markRead.isPending}
                onClick={() =>
                  markRead.mutate({
                    id: notification.id,
                  })
                }
              >
                Mark as read
              </Button>
            )}
            {href && (
              <Button
                size="sm"
                variant="outline"
                disabled={markRead.isPending}
                onClick={open}
              >
                View details
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function NotificationsPage() {
  const notifications = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()

  const items = notifications.data ?? []
  const hasUnread = items.some((notification) => !notification.read_at)

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Updates about your orders, returns, exchanges, payments, and wallet.
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate({})}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {notifications.isPending && (
          <p className="p-6 text-sm text-muted-foreground">
            Loading notifications...
          </p>
        )}
        {!notifications.isPending && items.length === 0 && (
          <div className="grid place-items-center gap-2 p-12 text-center">
            <HugeiconsIcon
              icon={Notification01Icon}
              className="size-8 text-muted-foreground"
            />
            <p className="font-medium">No notifications yet</p>
          </div>
        )}
        {items.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
      </div>
    </section>
  )
}
