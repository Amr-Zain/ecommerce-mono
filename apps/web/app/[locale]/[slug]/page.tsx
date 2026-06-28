import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { CmsPageView } from "@/components/cms/cms-page"
import { cmsPageTitle, getCmsPage } from "@/lib/server/cms-pages"
import { localeAlternates } from "@/lib/server/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getCmsPage(slug, locale)
  if (!page) return {}
  return {
    ...localeAlternates(`/${slug}`, locale),
    title: cmsPageTitle(page),
    description: page.content ?? undefined,
    openGraph: {
      title: cmsPageTitle(page),
      description: page.content ?? undefined,
      images: page.image?.url ? [page.image.url] : undefined,
    },
  }
}

export default async function DynamicCmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <CmsPageView locale={locale} slug={slug} />
}
