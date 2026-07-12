import "server-only"

import { publicBackendGet } from "@/lib/server/backend"

export type StorefrontConfiguration = {
  brand_name: string
  announcement: { enabled: boolean; text: string; url: string }
  contact: { email: string; phone: string; address: string }
  social_links: Record<
    "facebook" | "instagram" | "x" | "youtube" | "tiktok",
    string
  >
  app_links: { app_store: string; google_play: string }
  campaign: {
    enabled: boolean
    title: string
    cta_label: string
    url: string
    expires_at: string
  }
}

const FALLBACK_STOREFRONT: StorefrontConfiguration = {
  brand_name: "Ecommerce",
  announcement: { enabled: false, text: "", url: "" },
  contact: { email: "", phone: "", address: "" },
  social_links: { facebook: "", instagram: "", x: "", youtube: "", tiktok: "" },
  app_links: { app_store: "", google_play: "" },
  campaign: {
    enabled: false,
    title: "",
    cta_label: "",
    url: "",
    expires_at: "",
  },
}

export async function getStorefrontConfiguration(locale: string) {
  try {
    const response = await publicBackendGet<{ data: StorefrontConfiguration }>(
      "/client/home/storefront",
      {
        headers: { "accept-language": locale },
        revalidate: 60,
        retries: 0,
      }
    )
    return response.data
  } catch {
    return FALLBACK_STOREFRONT
  }
}
