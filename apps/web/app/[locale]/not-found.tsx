import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { StatePanel } from "@/components/shared/state-panel"
import { ROUTES } from "@/lib/routes"
import { getTranslations } from "next-intl/server"

export default async function NotFoundPage() {
  const t = await getTranslations("Experience")
  return <StatePanel icon={<HugeiconsIcon icon={Search01Icon} className="size-9" />} title={t("pageNotFound")} description={t("notFoundDescription")} secondaryHref={ROUTES.home} secondaryLabel={t("returnHome")} />
}
