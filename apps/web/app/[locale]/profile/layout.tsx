import * as React from "react"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { auth } from "@/auth"
import { redirect } from "@/i18n/navigation"
import { loginPath } from "@/lib/return-path"
import { headers } from "next/headers"
import { safeReturnPath } from "@/lib/return-path"

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const [{ locale }, session, requestHeaders] = await Promise.all([
    params,
    auth(),
    headers(),
  ])
  if (!session?.accessToken) {
    const returnTo = safeReturnPath(
      requestHeaders.get("x-next-url"),
      "/profile"
    )
    redirect({
      href: loginPath(returnTo, locale),
      locale: locale === "ar" ? "ar" : "en",
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <ProfileSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
