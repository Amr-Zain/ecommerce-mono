import { Login01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { auth } from "@/auth"
import { Button } from "@ecommerce/ui/components/button"
import { backendGet } from "@/lib/server/backend"
import { HeaderAccountDropdown } from "./header-account-dropdown"
import { HeaderNotificationLink } from "./header-notification-link"

type ProfileResponse = {
  data: {
    avatar?: {
      path?: string
    } | null
    image?: {
      path?: string
    } | null
  }
}

type UnreadCountResponse = {
  data: {
    count: number
  }
}

async function getAccountData(accessToken: string) {
  try {
    return await Promise.all([
      backendGet<ProfileResponse>("/client/profile", {
        accessToken,
        cache: "no-store",
        retries: 0,
      }),
      backendGet<UnreadCountResponse>("/client/notifications/unread-count", {
        accessToken,
        cache: "no-store",
        retries: 0,
      }),
    ])
  } catch {
    return [null, null] as const
  }
}

async function HeaderAccountControls() {
  const session = await auth()
  const loggedIn =
    Boolean(session?.accessToken) &&
    Boolean(session?.user) &&
    !session?.user.is_guest

  if (!loggedIn || !session?.accessToken || !session.user) {
    return (
      <Button render={<Link href="/auth/login" />} size="sm">
        <HugeiconsIcon icon={Login01Icon} />
        Login
      </Button>
    )
  }

  const [profile, unread] = await getAccountData(session.accessToken)
  const image =
    session.user.image ??
    profile?.data.avatar?.path ??
    profile?.data.image?.path
  const unreadCount = unread?.data.count ?? 0

  return (
    <>
      <HeaderNotificationLink initialUnreadCount={unreadCount} />
      <HeaderAccountDropdown
        image={image}
        name={session.user.name || session.user.email || "User"}
      />
    </>
  )
}

export { HeaderAccountControls }
