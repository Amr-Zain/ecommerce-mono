import { Location01Icon, Mail01Icon, MapsLocation01Icon, Search01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Metadata } from "next"
import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import { StatePanel } from "@/components/shared/state-panel"
import { ListingPagination } from "@/components/shared/pagination"
import { publicBackendGet } from "@/lib/server/backend"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { localeAlternates } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"
import type { ApiList, ApiResponse, PaginationMeta } from "@/types/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  return {
    ...localeAlternates(ROUTES.static.showRooms, locale),
    title: t("showRoomsTitle"),
    description: t("showRoomsDescription"),
  }
}

type ShowRoom = {
  id: string
  name?: string | null
  address?: string | null
  city?: string | null
  email?: string | null
  phone?: string | null
  phone_code?: string | null
  url?: string | null
  lat?: number | null
  lng?: number | null
  country?: { name?: string | null }
}

function unwrapShowrooms(response: unknown) {
  const data = (response as ApiResponse<ApiList<ShowRoom>>)?.data
  if (Array.isArray(data)) return { showrooms: data as ShowRoom[], meta: null }
  if (!data) return { showrooms: [], meta: null }
  const showrooms = "items" in data ? data.items : "data" in data ? data.data : []
  return { showrooms, meta: (data.meta ?? null) as PaginationMeta | null }
}

function positiveInt(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export default async function ShowRoomsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const query = await searchParams
  const page = positiveInt(query.page, 1)
  const limit = positiveInt(query.limit, 6)
  const t = await getTranslations("Experience")
  const seoT = await getTranslations("Seo")
  const response = await publicBackendGet<unknown>("/client/show-rooms", {
    headers: { "accept-language": locale },
    query: { paginate: 1, page, limit },
    retries: 0,
  })
  const { showrooms, meta } = unwrapShowrooms(response)
  const currentPage = meta?.page ?? page
  const totalPages = meta?.total_pages ?? currentPage

  if (!showrooms.length) {
    return <StatePanel icon={<HugeiconsIcon icon={Search01Icon} className="size-9" />} title={t("showroomsEmpty")} description={t("showroomsEmptyDescription")} secondaryHref="/collections" secondaryLabel={t("browseCollections")} />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10">
      <div className="space-y-2"><h1 className="text-3xl font-bold tracking-tight">{seoT("showRoomsTitle")}</h1><p className="text-sm text-muted-foreground">{seoT("showRoomsDescription")}</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        {showrooms.map((showroom) => {
          const country = showroom.country?.name
          const mapUrl = showroom.url ?? (showroom.lat != null && showroom.lng != null ? `https://www.google.com/maps?q=${showroom.lat},${showroom.lng}` : null)
          return (
            <Card key={showroom.id} className="rounded-xl shadow-none">
              <CardHeader className="grid-cols-[auto_1fr] gap-x-4">
                <div className="row-span-2 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={Location01Icon} className="size-6" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {showroom.name ?? seoT("showroomFallback")}
                </CardTitle>
                <CardDescription>
                  {[showroom.address, showroom.city, country].filter(Boolean).join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {showroom.phone && <a className="flex items-center gap-2 hover:text-primary" href={`tel:+${showroom.phone_code ?? ""}${showroom.phone}`}><HugeiconsIcon icon={SmartPhone01Icon} className="size-4" />+{showroom.phone_code} {showroom.phone}</a>}
                {showroom.email && <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${showroom.email}`}><HugeiconsIcon icon={Mail01Icon} className="size-4" />{showroom.email}</a>}
              </CardContent>
              {mapUrl && (
                <CardFooter>
                  <Button variant="outline" render={<a href={mapUrl} target="_blank" rel="noreferrer" />}>
                    <HugeiconsIcon icon={MapsLocation01Icon} />
                    {seoT("openMap")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
      <ListingPagination
        pathname="/show-rooms"
        searchParams={query}
        currentPage={currentPage}
        totalPages={totalPages}
        className="border-t"
      />
    </div>
  )
}
