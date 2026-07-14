import type { Meta } from '@/types/api/http'

export function getPaginationPage(meta: Meta, fallback = 1): number {
  return meta.page ?? meta.current_page ?? fallback
}

export function getPaginationLimit(meta: Meta, fallback: number): number {
  return meta.limit ?? meta.per_page ?? fallback
}

export function getPaginationPageCount(
  meta: Meta,
  fallbackLimit: number,
): number {
  const explicitPageCount = meta.total_pages ?? meta.last_page
  if (explicitPageCount !== undefined) return explicitPageCount

  const limit = getPaginationLimit(meta, fallbackLimit)
  return limit > 0 ? Math.max(1, Math.ceil(meta.total / limit)) : 1
}
