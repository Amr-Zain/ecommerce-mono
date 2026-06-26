import { CmsPageView } from "@/components/cms/cms-page"

export default async function DynamicCmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  return <CmsPageView locale={locale} slug={slug} />
}
