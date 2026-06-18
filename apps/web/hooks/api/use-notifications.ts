"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { queryKeys } from "@/hooks/api/query-keys"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"
import { ROUTES } from "@/lib/routes"
import { clientApiEndpoint, clientEndpoints } from "@/lib/client/client-api"
import { toast } from "@ecommerce/ui/components/sonner"

type Notification = {
  id: string
  type: string
  entity?: { type?: string; id?: string } | null
  data?: Record<string, unknown>
  title: string
  body: string
  read_at: string | null
  created_at: string
}

function valueAsString(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : undefined
}

function normalizeNotification(value: unknown): Notification | null {
  if (!value || typeof value !== "object") return null

  const item = value as Record<string, unknown>
  const data =
    item.data && typeof item.data === "object"
      ? (item.data as Record<string, unknown>)
      : {}
  const entityValue =
    item.entity && typeof item.entity === "object"
      ? (item.entity as Record<string, unknown>)
      : null
  const entityType =
    typeof item.entity === "string"
      ? item.entity
      : entityValue
        ? valueAsString(entityValue.type)
        : undefined
  const entityId =
    entityValue
      ? valueAsString(entityValue.id)
      : valueAsString(
          data.id ??
            data.ticketId ??
            data.ticket_id ??
            data.orderId ??
            data.order_id
        )
  const id = valueAsString(item.id)

  if (!id) return null

  return {
    id,
    type: valueAsString(item.type) ?? "notification",
    entity: entityType || entityId
      ? {
          id: entityId,
          type: entityType,
        }
      : null,
    data,
    title: valueAsString(item.title) ?? "Notification",
    body: valueAsString(item.body) ?? "",
    read_at: valueAsString(item.read_at ?? item.readAt) ?? null,
    created_at:
      valueAsString(item.created_at ?? item.createdAt) ??
      new Date().toISOString(),
  }
}

function responseItems(response: unknown) {
  const data = (response as { data?: unknown })?.data
  const items = (data as { items?: unknown })?.items
  return Array.isArray(items)
    ? items
        .map(normalizeNotification)
        .filter((item): item is Notification => item !== null)
    : []
}

function useNotifications() {
  return useFetch<unknown, Notification[]>({
    authRequired: true,
    endpoint: clientEndpoints.notifications,
    params: { limit: 50 },
    queryKey: queryKeys.notifications(),
    select: responseItems,
  })
}

function useNotificationUnreadCount(initialData?: number) {
  return useFetch<unknown, number>({
    authRequired: true,
    endpoint: clientEndpoints.notificationsUnreadCount,
    initialData:
      initialData === undefined ? undefined : { data: { count: initialData } },
    queryKey: queryKeys.notificationUnreadCount(),
    select: (response) =>
      Number((response as { data?: { count?: number } })?.data?.count ?? 0),
  })
}

function useMarkNotificationRead() {
  return useMutate<unknown, { id: string }>({
    authRequired: true,
    endpoint: (input) => clientEndpoints.notificationRead(input.id),
    body: () => undefined,
    mutationKey: ["notifications", "read"],
    method: "PATCH",
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.notifications(),
          queryKeys.notificationUnreadCount(),
        ],
      },
    },
  })
}

function useMarkAllNotificationsRead() {
  return useMutate<unknown, Record<string, never>>({
    authRequired: true,
    endpoint: clientEndpoints.notificationsReadAll,
    mutationKey: ["notifications", "read-all"],
    method: "PATCH",
    mutationOptions: {
      meta: {
        invalidates: [
          queryKeys.notifications(),
          queryKeys.notificationUnreadCount(),
        ],
      },
    },
  })
}

function useNotificationStream(enabled = true) {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    if (!enabled) return
    const source = new EventSource(
      clientApiEndpoint(clientEndpoints.notificationsStream)
    )
    const refreshCommon = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount() })
    }
    const refresh = (event: Event) => {
      refreshCommon()

      const notification = parseNotificationEvent(event)
      if (!notification || notification.type !== "ticket_reply") return

      const ticketId = ticketNotificationId(notification)
      if (!ticketId) return

      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets() })

      if (isCurrentTicketPath(pathname, ticketId)) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.ticket(ticketId) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.ticketMessages(ticketId) })
        return
      }

      toast(notification.title, {
        description: notification.body,
        action: {
          label: "View",
          onClick: () => router.push(ROUTES.profile.support.detail(ticketId)),
        },
      })
    }
    source.addEventListener("notification", refresh)
    source.onerror = () => source.close()

    return () => {
      source.removeEventListener("notification", refresh)
      source.close()
    }
  }, [enabled, pathname, queryClient, router])
}

function parseNotificationEvent(event: Event) {
  if (!("data" in event) || typeof (event as MessageEvent).data !== "string") {
    return null
  }

  try {
    return normalizeNotification(JSON.parse((event as MessageEvent).data))
  } catch {
    return null
  }
}

function ticketNotificationId(notification: Notification) {
  return valueAsString(
    notification.entity?.id ??
      notification.data?.ticketId ??
      notification.data?.ticket_id
  )
}

function isCurrentTicketPath(pathname: string, ticketId: string) {
  const match = pathname.match(/\/profile\/support\/([^/?#]+)/)
  return match?.[1] === ticketId
}

function notificationHref(notification: Notification) {
  const entity = notification.entity
  const orderId = valueAsString(
    notification.data?.order_id ?? notification.data?.orderId
  )

  switch (entity?.type) {
    case "order":
      return entity.id ? ROUTES.profile.orders.detail(entity.id) : ROUTES.profile.orders.root
    case "return":
    case "exchange":
      return orderId ? ROUTES.profile.orders.detail(orderId) : ROUTES.profile.returns
    case "payment":
      return orderId ? ROUTES.profile.orders.detail(orderId) : ROUTES.profile.wallet
    case "wallet":
    case "withdrawal":
      return ROUTES.profile.wallet
    case "ticket":
      return entity.id ? ROUTES.profile.support.detail(entity.id) : ROUTES.profile.support.root
    default:
      return null
  }
}

export {
  notificationHref,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationStream,
  useNotificationUnreadCount,
}
export type { Notification }
