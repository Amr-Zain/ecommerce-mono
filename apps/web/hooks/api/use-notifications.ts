"use client"

import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { queryKeys } from "@/hooks/api/query-keys"
import { useFetch } from "@/hooks/api/use-fetch"
import { useMutate } from "@/hooks/api/use-mutate"

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
  const entityValue =
    item.entity && typeof item.entity === "object"
      ? (item.entity as Record<string, unknown>)
      : null
  const id = valueAsString(item.id)

  if (!id) return null

  return {
    id,
    type: valueAsString(item.type) ?? "notification",
    entity: entityValue
      ? {
          id: valueAsString(entityValue.id),
          type: valueAsString(entityValue.type),
        }
      : null,
    data:
      item.data && typeof item.data === "object"
        ? (item.data as Record<string, unknown>)
        : {},
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
    endpoint: "/api/client/notifications",
    params: { limit: 50 },
    queryKey: queryKeys.notifications(),
    select: responseItems,
  })
}

function useNotificationUnreadCount(initialData?: number) {
  return useFetch<unknown, number>({
    endpoint: "/api/client/notifications/unread-count",
    initialData:
      initialData === undefined ? undefined : { data: { count: initialData } },
    queryKey: queryKeys.notificationUnreadCount(),
    select: (response) =>
      Number((response as { data?: { count?: number } })?.data?.count ?? 0),
  })
}

function useMarkNotificationRead() {
  return useMutate<unknown, { _endpoint: string }>({
    endpoint: "/api/client/notifications",
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
    endpoint: "/api/client/notifications/read-all",
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

  React.useEffect(() => {
    if (!enabled) return
    const source = new EventSource("/api/client/notifications/stream")
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount() })
    }
    source.addEventListener("notification", refresh)
    source.onerror = () => source.close()

    return () => {
      source.removeEventListener("notification", refresh)
      source.close()
    }
  }, [enabled, queryClient])
}

function notificationHref(notification: Notification) {
  const entity = notification.entity
  const orderId = valueAsString(
    notification.data?.order_id ?? notification.data?.orderId
  )

  switch (entity?.type) {
    case "order":
      return entity.id ? `/profile/orders/${entity.id}` : "/profile/orders"
    case "return":
    case "exchange":
      return orderId ? `/profile/orders/${orderId}` : "/profile/returns"
    case "payment":
      return orderId ? `/profile/orders/${orderId}` : "/profile/wallet"
    case "wallet":
    case "withdrawal":
      return "/profile/wallet"
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
