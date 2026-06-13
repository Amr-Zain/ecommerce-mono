import { Location01Icon, Mail01Icon, MapsLocation01Icon, Search01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@ecommerce/ui/components/button"
import { StatePanel } from "@/components/shared/state-panel"
import { publicBackendGet } from "@/lib/server/backend"
import { getTranslations } from "next-intl/server"

type ShowRoom = {
  id: string
  email?: string | null
  phone?: string | null
  phone_code?: string | null
  url?: string | null
  lat?: number | null
  lng?: number | null
  country?: { translations?: Array<{ name?: string }> }
  translations?: Array<{ name?: string; address?: string; city?: string }>
}

function items(response: unknown) {
  const data = (response as { data?: unknown })?.data
  if (Array.isArray(data)) return data as ShowRoom[]
  const nested = (data as { items?: unknown })?.items
  return Array.isArray(nested) ? (nested as ShowRoom[]) : []
}

export default async function ShowRoomsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations("Experience")
  const response = await publicBackendGet<unknown>("/client/show-rooms", {
    headers: { "accept-language": locale },
    retries: 0,
  })
  const showrooms = items(response)

  if (!showrooms.length) {
    return <StatePanel icon={<HugeiconsIcon icon={Search01Icon} className="size-9" />} title={t("showroomsEmpty")} description={t("showroomsEmptyDescription")} secondaryHref="/collections" secondaryLabel={t("browseCollections")} />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10">
      <div className="space-y-2"><h1 className="text-3xl font-bold tracking-tight">Our Showrooms</h1><p className="text-sm text-muted-foreground">Visit a location to experience our collections in person.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        {showrooms.map((showroom) => {
          const translation = showroom.translations?.[0]
          const country = showroom.country?.translations?.[0]?.name
          const mapUrl = showroom.url ?? (showroom.lat != null && showroom.lng != null ? `https://www.google.com/maps?q=${showroom.lat},${showroom.lng}` : null)
          return (
            <article key={showroom.id} className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><HugeiconsIcon icon={Location01Icon} className="size-6" /></div><div><h2 className="text-lg font-bold">{translation?.name ?? "Showroom"}</h2><p className="mt-1 text-sm text-muted-foreground">{[translation?.address, translation?.city, country].filter(Boolean).join(", ")}</p></div></div>
              <div className="mt-6 space-y-3 text-sm">
                {showroom.phone && <a className="flex items-center gap-2 hover:text-primary" href={`tel:+${showroom.phone_code ?? ""}${showroom.phone}`}><HugeiconsIcon icon={SmartPhone01Icon} className="size-4" />+{showroom.phone_code} {showroom.phone}</a>}
                {showroom.email && <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${showroom.email}`}><HugeiconsIcon icon={Mail01Icon} className="size-4" />{showroom.email}</a>}
              </div>
              {mapUrl && <Button className="mt-6" variant="outline" render={<a href={mapUrl} target="_blank" rel="noreferrer" />}><HugeiconsIcon icon={MapsLocation01Icon} />Open map</Button>}
            </article>
          )
        })}
      </div>
    </div>
  )
}
