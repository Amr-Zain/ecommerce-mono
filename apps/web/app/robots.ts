import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/server/seo"

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/wishlist",
          "/checkout",
          "/profile",
          "/auth",
          "/api",
          "/ar/cart",
          "/ar/wishlist",
          "/ar/checkout",
          "/ar/profile",
          "/ar/auth",
        ],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
    host: base,
  }
}