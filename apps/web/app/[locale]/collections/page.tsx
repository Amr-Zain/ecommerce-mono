import { Link } from "@/i18n/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import type { CollectionTreeItem } from "@/hooks/api/use-products"
import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags } from "@/lib/server/cache-tags"
import { localeAlternates } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  return {
    ...localeAlternates(ROUTES.collections.root, locale),
    title: t("collectionsTitle"),
    description: t("collectionsDescription"),
  }
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  const tc = await getTranslations("Collections")

  const response = await publicBackendGet<{ data: CollectionTreeItem[] }>("/client/collections/tree", {
    revalidate: 60,
    tags: [cacheTags.categories],
    retries: 0,
  })

  return (
    <div className="space-y-10 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t("collectionsTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("collectionsDescription")}</p>
      </div>
      {response.data.map((root) => (
        <section key={root.id} className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              {root.image ? (
                <Image
                  src={root.image}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 rounded-lg object-cover"
                />
              ) : null}
              <div>
              <Link href={`/collections/${root.slug}`} className="text-xl font-semibold hover:underline">{root.name}</Link>
              {root.description ? <p className="text-sm text-muted-foreground">{root.description}</p> : null}
              </div>
            </div>
            <Button render={<Link href={`/collections/${root.slug}`} />} variant="outline">
              {tc("viewAll")} ({root._count?.products ?? 0})
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(root.children ?? []).map((child) => (
              <Card key={child.id}>
                {child.image ? (
                  <Image
                    src={child.image}
                    alt=""
                    width={480}
                    height={240}
                    className="aspect-2/1 w-full rounded-t-xl object-cover"
                  />
                ) : null}
                <CardHeader>
                  <CardTitle><Link href={`/collections/${child.slug}`} className="hover:underline">{child.name}</Link></CardTitle>
                  <CardDescription>{tc("productCount", { count: child._count?.products ?? 0 })}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {child.children?.map((leaf) => (
                    <Button key={leaf.id} render={<Link href={`/collections/${leaf.slug}`} />} variant="ghost" className="justify-between">
                      <span>{leaf.name}</span><span className="text-muted-foreground">{leaf._count?.products ?? 0}</span>
                    </Button>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button render={<Link href={`/collections/${child.slug}`} />} variant="link">{tc("viewCollection", { name: child.name })}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
