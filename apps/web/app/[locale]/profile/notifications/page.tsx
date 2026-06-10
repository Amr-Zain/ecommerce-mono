"use client"

import { Notification01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useFetch } from "@/hooks/api/use-fetch"

type Notification = {
  id: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

type NotificationsResponse = {
  data: {
    items: Notification[]
  }
}

export default function NotificationsPage() {
  const notifications = useFetch<NotificationsResponse>({
    queryKey: ["notifications"],
    endpoint: "/api/client/notifications",
    params: { limit: 50 },
    disableErrorToast: true,
  })

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Updates about your orders, returns, exchanges, and payments.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {notifications.isLoading && (
          <p className="p-6 text-sm text-muted-foreground">
            Loading notifications...
          </p>
        )}
        {!notifications.isLoading &&
          notifications.data?.data.items.length === 0 && (
            <div className="grid place-items-center gap-2 p-12 text-center">
              <HugeiconsIcon
                icon={Notification01Icon}
                className="size-8 text-muted-foreground"
              />
              <p className="font-medium">No notifications yet</p>
            </div>
          )}
        {notifications.data?.data.items.map((notification) => (
          <article
            key={notification.id}
            className="flex gap-3 border-b p-4 last:border-b-0"
          >
            <span
              className={`mt-2 size-2 shrink-0 rounded-full ${
                notification.readAt ? "bg-muted" : "bg-primary"
              }`}
            />
            <div className="min-w-0">
              <h2 className="font-medium">{notification.title}</h2>
              <p className="text-sm text-muted-foreground">
                {notification.body}
              </p>
              <time className="mt-1 block text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </time>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
