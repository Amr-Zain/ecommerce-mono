"use client"

import * as React from "react"
import { Link, usePathname } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { normalizeUploadUrl } from "@/lib/media-url"
import Image from "next/image"
import { Badge } from "@ecommerce/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  PackageIcon,
  Location01Icon,
  Wallet01Icon,
  ArrowLeftRightIcon,
  Ticket01Icon,
  Logout01Icon,
  Camera01Icon,
  FavouriteIcon,
  GiftIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "@ecommerce/ui/components/sonner"
import {
  uploadCurrentUserImage,
  useCurrentUser,
  useUpdateCurrentUserImage,
  type CurrentUserProfile,
  type ProfileMedia,
} from "@/hooks/api/use-current-user"

const SIDEBAR_LINKS = [
  { name: "My account", href: ROUTES.profile.root, icon: UserCircleIcon },
    { name: "My Wishlist", href: ROUTES.profile.wishlist, icon: FavouriteIcon },
  { name: "My Orders", href: ROUTES.profile.orders.root, icon: PackageIcon },
  // {
  //   name: "Order Details",
  //   href: "/profile/orders/details",
  //   icon: DocumentValidationIcon,
  // },
  { name: "My Addresses", href: ROUTES.profile.addresses, icon: Location01Icon },
  { name: "My Wallet", href: ROUTES.profile.wallet, icon: Wallet01Icon },
  { name: "My Loyalty", href: ROUTES.profile.loyalty, icon: GiftIcon },
  // { name: "Payment", href: "/profile/payment", icon: CreditCardIcon },
  // { name: "Gift Cards", href: "/profile/gift-cards", icon: GiftIcon },
  {
    name: "Return & Refunds",
    href: ROUTES.profile.returns,
    icon: ArrowLeftRightIcon,
  },
  // { name: "Email Newsletter", href: "/profile/newsletter", icon: Mail01Icon },
  { name: "Support Tickets", href: ROUTES.profile.support.root, icon: Ticket01Icon },
]

function getMediaUrl(media?: ProfileMedia | string | null) {
  if (!media) return null
  const url = typeof media === "string" ? media : media.url ?? media.path
  return normalizeUploadUrl(url)
}

function getProfileImage(profile?: CurrentUserProfile, sessionImage?: string | null) {
  return (
    getMediaUrl(profile?.avatar) ??
    getMediaUrl(profile?.image) ??
    normalizeUploadUrl(sessionImage)
  )
}

export function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session, update: updateSession } = useSession()
  const { data: currentUser } = useCurrentUser()
  const updateImage = useUpdateCurrentUserImage()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const profile = currentUser?.data
  const tier = profile?.tier ?? profile?.loyalty?.tier
  const image = getProfileImage(profile, session?.user.image)
  const displayName = profile?.name || session?.user.name || "User"
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
      toast.error("Please choose an image file.")
      return
    }

    try {
      setUploading(true)
      const attachHash = await uploadCurrentUserImage(file)
      updateImage.mutate(
        { image: attachHash },
        {
          onSuccess: async (response) => {
            const updatedImage = getProfileImage(response.data, session?.user.image)
            await updateSession({
              user: {
                image: updatedImage,
              },
            })
            toast.success("Profile photo updated")
          },
        }
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile photo upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 rounded-xl border bg-card p-6 sm:w-[280px]">
      {/* Profile Header */}
      <div className="flex flex-col gap-4 border-b pb-6">
        <div className="flex flex-col gap-2">
          <div className="relative size-16 overflow-hidden rounded-xl border bg-muted/50">
            {image ? (
              <Image
                src={image}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-lg font-bold text-muted-foreground">
                {initials || "U"}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="flex items-center gap-1.5 text-left text-xs font-semibold text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={imagePending}
            onClick={() => fileInputRef.current?.click()}
          >
            <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
            {imagePending ? "Uploading..." : "Edit Profile Photo"}
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground">{profile?.email || session?.user.email}</p>
          {tier?.name && (
            <Badge
              variant="secondary"
              className="mt-2 w-fit"
              style={tier.color ? { borderColor: tier.color, color: tier.color } : undefined}
            >
              {tier.name} {tier.multiplier ? `${tier.multiplier}x` : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
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
              {link.name}
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
            Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}
