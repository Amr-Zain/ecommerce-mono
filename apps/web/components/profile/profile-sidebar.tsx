"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { normalizeUploadUrl } from "@/lib/media-url"
import Image from "next/image"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  PackageIcon,
  Location01Icon,
  Wallet01Icon,
  CreditCardIcon,
  ArrowLeftRightIcon,
  Ticket01Icon,
  Logout01Icon,
  Edit01Icon,
  FavouriteIcon,
  GiftIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "@ecommerce/ui/components/sonner"
import { useTranslations } from "next-intl"
import {
  uploadCurrentUserImage,
  useCurrentUser,
  useUpdateCurrentUserImage,
  type CurrentUserProfile,
  type ProfileMedia,
} from "@/hooks/api/use-current-user"

const SIDEBAR_LINKS = [
  { key: "account", href: ROUTES.profile.root, icon: UserCircleIcon },
  { key: "wishlist", href: ROUTES.profile.wishlist, icon: FavouriteIcon },
  { key: "orders", href: ROUTES.profile.orders.root, icon: PackageIcon },
  // {
  //   name: "Order Details",
  //   href: "/profile/orders/details",
  //   icon: DocumentValidationIcon,
  // },
  {
    key: "addresses",
    href: ROUTES.profile.addresses,
    icon: Location01Icon,
  },
  { key: "wallet", href: ROUTES.profile.wallet, icon: Wallet01Icon },
  {
    key: "payments",
    href: ROUTES.profile.payments,
    icon: CreditCardIcon,
  },
  { key: "loyalty", href: ROUTES.profile.loyalty, icon: GiftIcon },
  // { name: "Payment", href: "/profile/payment", icon: CreditCardIcon },
  // { name: "Gift Cards", href: "/profile/gift-cards", icon: GiftIcon },
  {
    key: "returns",
    href: ROUTES.profile.returns,
    icon: ArrowLeftRightIcon,
  },
  // { name: "Email Newsletter", href: "/profile/newsletter", icon: Mail01Icon },
  {
    key: "support",
    href: ROUTES.profile.support.root,
    icon: Ticket01Icon,
  },
  { key: "security", href: ROUTES.profile.security, icon: SecurityCheckIcon },
]

function getMediaUrl(media?: ProfileMedia | string | null) {
  if (!media) return null
  const url = typeof media === "string" ? media : (media.url ?? media.path)
  return normalizeUploadUrl(url)
}

function getProfileImage(
  profile?: CurrentUserProfile,
  sessionImage?: string | null
) {
  return (
    getMediaUrl(profile?.avatar) ??
    getMediaUrl(profile?.image) ??
    normalizeUploadUrl(sessionImage)
  )
}

export function ProfileSidebar() {
  const t = useTranslations("ProfileNav")
  const pathname = usePathname()
  const { data: session, update: updateSession } = useSession()
  const { data: currentUser } = useCurrentUser()
  const updateImage = useUpdateCurrentUserImage()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const profile = currentUser?.data
  const tier = profile?.tier ?? profile?.loyalty?.tier
  const image = getProfileImage(profile, session?.user.image)
  const displayName = profile?.name || session?.user.name || t("user")
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const imagePending = uploading || updateImage.isPending

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(t("imageOnly"))
      return
    }

    try {
      setUploading(true)
      const attachHash = await uploadCurrentUserImage(file)
      updateImage.mutate(
        { image: attachHash },
        {
          onSuccess: async (response) => {
            const updatedImage = getProfileImage(
              response.data,
              session?.user.image
            )
            await updateSession({
              user: {
                image: updatedImage,
              },
            })
            toast.success(t("photoUpdated"))
          },
        }
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("photoUploadFailed")
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col rounded-2xl border bg-card p-4 shadow-sm md:sticky md:top-[8rem] md:h-[calc(100dvh-8.75rem)] md:w-[280px]">
      {/* Profile Header */}
      <div className="relative flex items-center gap-3 border-b pb-4">
        <div className="relative size-12 shrink-0 overflow-visible rounded-xl border bg-muted/50">
          {image ? (
            <Image
              src={image}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-bold text-muted-foreground">
              {initials || "U"}
            </div>
          )}
          <Button
            type="button"
            variant="default"
            size="icon-sm"
            className="absolute -end-1 -bottom-1 size-5 rounded-full p-0 shadow-sm"
            disabled={imagePending}
            onClick={() => fileInputRef.current?.click()}
            aria-label={imagePending ? t("uploading") : t("editPhoto")}
            title={imagePending ? t("uploading") : t("editPhoto")}
          >
            <HugeiconsIcon icon={Edit01Icon} className="size-3" />
          </Button>
        </div>
        <div className="min-w-0 flex-1 pe-16">
          <h2 className="truncate text-sm font-bold">{displayName}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {profile?.email || session?.user.email}
          </p>
        </div>
        {tier?.name && (
          <Badge
            variant="secondary"
            className="absolute end-0 top-0 text-[10px]"
            style={
              tier.color
                ? { borderColor: tier.color, color: tier.color }
                : undefined
            }
          >
            {tier.name} {tier.multiplier ? `${tier.multiplier}x` : ""}
          </Badge>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      <nav className="-me-2 mt-3 flex min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] flex-col gap-1 overflow-y-auto pe-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={link.icon}
                className={cn("size-4.5", isActive && "text-foreground")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {t(link.key)}
            </Link>
          )
        })}

        <div className="mt-auto border-t pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground">
            <HugeiconsIcon
              icon={Logout01Icon}
              className="size-4.5"
              strokeWidth={2}
            />
            {t("logout")}
          </button>
        </div>
      </nav>
    </aside>
  )
}
