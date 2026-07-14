import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { getDashboardAccessToken } from '@/lib/dashboard-session'
import { queryKeys } from '@/util/queryKeysFactory'
import { toast } from 'sonner'
import { ADMIN_API_BASE_URL } from '@/lib/env'

type SSEEvent = {
  event: string
  data: string
}

type NotificationPayload = {
  id?: string | number
  type?: string
  title?: string
  body?: string
  entity?: { type?: string; id?: string | number } | null
  data?: Record<string, unknown>
}

function parseSSEChunk(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = []
  const blocks = chunk.split('\n\n')
  for (const block of blocks) {
    if (!block.trim()) continue
    let event = 'message'
    const dataLines: string[] = []
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      }
    }
    if (dataLines.length > 0) {
      events.push({ event, data: dataLines.join('\n') })
    }
  }
  return events
}

function parseNotification(data: string): NotificationPayload | null {
  try {
    const parsed = JSON.parse(data)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as NotificationPayload
  } catch {
    return null
  }
}

function getNotificationLink(notification: NotificationPayload): string | null {
  const type = (notification.type || '').toLowerCase()
  const entity = notification.entity
  const entityId = entity?.id ? String(entity.id) : null
  const entityType = entity?.type?.toLowerCase()

  const dataId = notification.data
    ? String(
        notification.data.id ??
          notification.data.order_id ??
          notification.data.orderId ??
          notification.data.user_id ??
          notification.data.userId ??
          notification.data.product_id ??
          notification.data.productId ??
          notification.data.ticket_id ??
          notification.data.ticketId
      )
    : null

  const targetId = entityId ?? dataId

  if (entityType === 'order' || type.includes('order')) {
    return targetId ? `/orders/show/${targetId}` : '/orders'
  }
  if (entityType === 'return' || type.includes('return')) {
    return '/returns'
  }
  if (entityType === 'exchange' || type.includes('exchange')) {
    return '/exchanges'
  }
  if (entityType === 'user' || type.includes('user') || type.includes('tier')) {
    return targetId ? `/users/show/${targetId}` : '/users'
  }
  if (entityType === 'product' || type.includes('product')) {
    return targetId ? `/products/show/${targetId}` : '/products'
  }
  if (entityType === 'review' || type.includes('review')) {
    return targetId ? `/reviews/show/${targetId}` : '/reviews'
  }
  if (entityType === 'ticket' || type.includes('ticket')) {
    return targetId ? `/tickets/show/${targetId}` : '/tickets'
  }
  if (entityType === 'payment' || type.includes('payment')) {
    return '/payment-gateways'
  }

  return null
}

export function useNotificationStream(enabled = true) {
  const queryClient = useQueryClient()
  useDashboardProfile()
  const token = getDashboardAccessToken()
  const abortRef = useRef<AbortController | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !token) return

    const baseUrl = ADMIN_API_BASE_URL
    if (!baseUrl) return
    const streamUrl = `${baseUrl}/notifications/stream`

    let stopped = false

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    }

    const connect = () => {
      if (stopped) return

      const controller = new AbortController()
      abortRef.current = controller

      fetch(streamUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok || !response.body) {
            scheduleReconnect()
            return
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          const read = (): Promise<void> =>
            reader.read().then(({ done, value }) => {
              if (done || stopped) return
              buffer += decoder.decode(value, { stream: true })

              const lastDoubleNewline = buffer.lastIndexOf('\n\n')
              if (lastDoubleNewline !== -1) {
                const complete = buffer.slice(0, lastDoubleNewline + 2)
                buffer = buffer.slice(lastDoubleNewline + 2)

                for (const evt of parseSSEChunk(complete)) {
                  if (evt.event === 'notification' || evt.event === 'message') {
                    const notification = parseNotification(evt.data)
                    if (!notification) continue

                    refresh()

                    const link = getNotificationLink(notification)
                    toast(notification.title || 'Notification', {
                      description: notification.body,
                      action: link
                        ? {
                            label: 'View',
                            onClick: () => {
                              window.location.href = link
                            },
                          }
                        : undefined,
                    })
                  }
                }
              }

              return read()
            })

          return read()
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || stopped) return
          scheduleReconnect()
        })
    }

    const scheduleReconnect = () => {
      if (stopped) return
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = setTimeout(connect, 5000)
    }

    connect()

    return () => {
      stopped = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      abortRef.current?.abort()
      abortRef.current = null
    }
  }, [enabled, token, queryClient])
}
