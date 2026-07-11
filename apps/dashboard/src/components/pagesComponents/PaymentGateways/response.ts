import type { Meta } from '@/types/api/http'

type ApiList<T> = {
  items: Array<T>
  meta?: Meta
}

function unwrapData<T = unknown>(response: unknown): T | undefined {
  const root = response as { data?: unknown } | undefined
  const first = root?.data
  const nested = first as { data?: unknown } | undefined
  return (nested?.data ?? first) as T | undefined
}

function unwrapList<T = unknown>(
  response: unknown,
  collectionKey?: string,
): ApiList<T> {
  const data = unwrapData<Record<string, unknown> | Array<T>>(response)

  if (Array.isArray(data)) {
    return { items: data }
  }

  const record = data && typeof data === 'object' ? data : {}
  const items =
    (Array.isArray(record.items) ? record.items : undefined) ??
    (collectionKey && Array.isArray(record[collectionKey])
      ? record[collectionKey]
      : undefined) ??
    []

  return {
    items: items as Array<T>,
    meta: (record as { meta?: Meta }).meta,
  }
}

function unwrapOne<T = unknown>(response: unknown): T | undefined {
  const data = unwrapData<T | { data?: T }>(response)
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data
  }
  return data as T | undefined
}

export { unwrapData, unwrapList, unwrapOne }
