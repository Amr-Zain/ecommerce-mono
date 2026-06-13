"use client"

import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect } from "react"
import { StatePanel } from "@/components/shared/state-panel"
import { ROUTES } from "@/lib/routes"
import { useTranslations } from "next-intl"

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const t = useTranslations("Experience")
  useEffect(() => console.error(error), [error])
  return <StatePanel icon={<HugeiconsIcon icon={Alert02Icon} className="size-9" />} title={t("somethingWrong")} description={t("errorDescription")} action={{ label: t("tryAgain"), onClick: unstable_retry }} secondaryHref={ROUTES.home} secondaryLabel={t("returnHome")} />
}
