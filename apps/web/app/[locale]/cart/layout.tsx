import type { Metadata } from "next"

import { localeAlternates, noindexMetadata } from "@/lib/server/seo"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = {
  ...noindexMetadata,
  ...localeAlternates(ROUTES.cart, "en"),
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}