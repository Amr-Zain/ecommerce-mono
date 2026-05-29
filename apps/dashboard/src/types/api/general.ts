
export type Image = {
  path: string
  url?: string
  id?: string | number
  attach_hash?: string
  hash?: string
  uuid: string | number
  original_name?: string
  mime_type: string
  type?: string
  size?: number
  collection?: string
}

export interface Filters {
  page?: string
  search?: string
  'filters[isActive]'?: string
  'filters[createdAt]'?: string
  'sort[createdAt]'?: string
}

export const toStr = (v: unknown): string | undefined =>
  v == null ? undefined : String(v);

export const searchParamsValidate = (search: Record<any, any>): Filters => {
  return cleanObject({
    page: toStr(search.page),
    search: toStr(search.search),
    ['filters[isActive]']: toStr(search['filters[isActive]']),
    ['filters[createdAt]']: toStr(search['filters[createdAt]']),
    ['sort[createdAt]']: toStr(search['sort[createdAt]']),
  })
}

export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleanedEntries = Object.entries(obj).filter(
    ([key, value]) => value != null,
  )
  return Object.fromEntries(cleanedEntries) as Partial<T>
}
