import { Login01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { getTranslations } from "next-intl/server"

import { auth } from "@/auth"
import { Button } from "@ecommerce/ui/components/button"
import { backendGet } from "@/lib/server/backend"
import { normalizeUploadUrl } from "@/lib/media-url"
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

async function HeaderAccountControls({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Header" })
  const session = await auth()
  const loggedIn = Boolean(session?.accessToken) && Boolean(session?.user)

  if (!loggedIn || !session?.accessToken || !session.user) {
    return (
      <Button render={<Link href={ROUTES.auth.login} />} size="sm">
        <HugeiconsIcon icon={Login01Icon} />
        {t("login")}
      </Button>
    )
  }

  const [profile, unread] = await getAccountData(session.accessToken)
  const image = normalizeUploadUrl(
    profile?.data.avatar?.path ??
      profile?.data.image?.path ??
      session.user.image
  )
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
