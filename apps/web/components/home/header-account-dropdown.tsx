"use client"

import {
  Location01Icon,
  Logout01Icon,
  PackageIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link, useRouter } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { normalizeUploadUrl } from "@/lib/media-url"
import * as React from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"

import { logoutAction } from "@/actions/auth"
import { useCommerceSessionSync } from "@/hooks/api/use-commerce-session-sync"
import { useCurrentUser } from "@/hooks/api/use-current-user"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@ecommerce/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ecommerce/ui/components/dropdown-menu"

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  )
}

function HeaderAccountDropdown({
  image,
  name,
}: {
  image?: string | null
  name: string
}) {
  const t = useTranslations("ProfileNav")
  const router = useRouter()
  const { data: session } = useSession()
  const { data: currentUser } = useCurrentUser()
  const syncCommerceSession = useCommerceSessionSync()
  const [loggingOut, startLogout] = React.useTransition()
  const profile = currentUser?.data
  const avatar =
    profile?.avatar?.path ??
    profile?.avatar?.url ??
    (typeof profile?.image === "string"
      ? profile.image
      : (profile?.image?.path ?? profile?.image?.url)) ??
    session?.user.image ??
    image
  const resolvedImage = normalizeUploadUrl(avatar)
  const resolvedName =
    profile?.name || session?.user.name || session?.user.email || name

  const logout = () => {
    startLogout(async () => {
      const result = await logoutAction("/")
      if (result.ok) {
        await syncCommerceSession()
        router.replace(result.data.redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("accountMenu")}
        render={
          <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        <Avatar className="size-9 rounded-sm">
          {resolvedImage && (
            <AvatarImage src={resolvedImage} alt={resolvedName} />
          )}
          <AvatarFallback className="rounded-full font-semibold">
            {initials(resolvedName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {resolvedName}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={ROUTES.profile.root} />}>
            <HugeiconsIcon icon={UserCircleIcon} />
            {t("account")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={ROUTES.profile.orders.root} />}>
            <HugeiconsIcon icon={PackageIcon} />
            {t("orders")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={ROUTES.profile.addresses} />}>
            <HugeiconsIcon icon={Location01Icon} />
            {t("addresses")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={loggingOut}
            onClick={logout}
          >
            <HugeiconsIcon icon={Logout01Icon} />
            {loggingOut ? t("loggingOut") : t("logout")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { HeaderAccountDropdown }
