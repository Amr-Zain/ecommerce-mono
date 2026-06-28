import type { Metadata } from "next"

import { StorefrontHome } from "@/components/home/storefront-home"
import { localeAlternates } from "@/lib/server/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return localeAlternates("/", locale)
}

export default function Page() {
  return <StorefrontHome />
}
