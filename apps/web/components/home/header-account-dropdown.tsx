"use client"

import {
  Location01Icon,
  Logout01Icon,
  PackageIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

import { logoutAction } from "@/actions/auth"
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
  const router = useRouter()
  const [loggingOut, startLogout] = React.useTransition()

  const logout = () => {
    startLogout(async () => {
      const result = await logoutAction("/")
      if (result.ok) {
        router.replace(result.data.redirectTo)
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        render={
          <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        <Avatar className="size-9 rounded-sm">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="rounded-full font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <HugeiconsIcon icon={UserCircleIcon} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile/orders" />}>
            <HugeiconsIcon icon={PackageIcon} />
            My Orders
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/profile/addresses" />}>
            <HugeiconsIcon icon={Location01Icon} />
            My Addresses
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={loggingOut}
            onClick={logout}
          >
            <HugeiconsIcon icon={Logout01Icon} />
            {loggingOut ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { HeaderAccountDropdown }
