import "server-only"

import { publicBackendGet } from "@/lib/server/backend"
import { cacheTags, staticPageTag } from "@/lib/server/cache-tags"
import type { ApiList, ApiResponse } from "@/types/api"

export type CmsPageSection = {
  id: string
  sort_order?: number | null
  title?: string | null
  content?: string | null
  image?: CmsImage | null
}

export type CmsImage = {
  path?: string | null
  url?: string | null
  original_name?: string | null
  originalName?: string | null
}

export type CmsPage = {
  id: string
  slug: string
  title?: string | null
  content?: string | null
  image?: CmsImage | null
  sections?: CmsPageSection[]
}

function readableSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function unwrapList(response: unknown): CmsPage[] {
  const data = (response as ApiResponse<ApiList<CmsPage>>)?.data
  if (Array.isArray(data)) return data as CmsPage[]
  if (!data) return []
  return "items" in data ? data.items : "data" in data ? data.data : []
}

export function cmsPageTitle(page: Pick<CmsPage, "slug" | "title">) {
  return page.title?.trim() || readableSlug(page.slug)
}

export async function getCmsPages(locale: string) {
  const response = await publicBackendGet<unknown>("/client/static-pages", {
    headers: { "accept-language": locale },
    revalidate: 60,
    tags: [cacheTags.staticPages],
    retries: 0,
  }).catch(() => null)

  return unwrapList(response)
}

export async function getCmsPage(slug: string, locale: string) {
  const response = await publicBackendGet<ApiResponse<CmsPage>>(`/client/static-pages/${slug}`, {
    headers: { "accept-language": locale },
    revalidate: 60,
    tags: [cacheTags.staticPages, staticPageTag(slug)],
    retries: 0,
  }).catch(() => null)

  return response?.data ?? null
}

export function pickCmsPages(pages: CmsPage[], slugs: string[]) {
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  return slugs.flatMap((slug) => {
    const page = pageBySlug.get(slug)
    return page ? [page] : []
  })
}
