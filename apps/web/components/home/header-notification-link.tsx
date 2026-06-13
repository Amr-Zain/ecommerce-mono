"use client"

import { Notification01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@ecommerce/ui/components/avatar"
import {
  useNotificationStream,
  useNotificationUnreadCount,
} from "@/hooks/api/use-notifications"

function HeaderNotificationLink({
  initialUnreadCount,
}: {
  initialUnreadCount: number
}) {
  const unread = useNotificationUnreadCount(initialUnreadCount)
  useNotificationStream()

  const unreadCount = unread.data ?? initialUnreadCount

  return (
    <Link
      href={ROUTES.profile.notifications}
      aria-label={`Notifications (${unreadCount} unread)`}
    >
      <Avatar className="size-9 rounded-sm after:border-none">
        <AvatarFallback className="rounded-sm bg-transparent text-foreground transition-colors hover:bg-muted">
          <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />
        </AvatarFallback>
        {unreadCount > 0 && (
          <AvatarBadge className="-top-1 -right-1 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground group-data-[size=default]/avatar:size-4">
            {unreadCount > 99 ? "99+" : unreadCount}
          </AvatarBadge>
        )}
      </Avatar>
    </Link>
  )
}

export { HeaderNotificationLink }
