import type {
  AxiosError,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from 'axios'

type ApiResponseItems<T> = T extends readonly (infer Item)[] ? Item[] : T[]
type ApiResponseCollection<T, TCollectionKey extends string> =
  [TCollectionKey] extends [never]
    ? {}
    : { [Key in TCollectionKey]?: T extends readonly unknown[] ? T : ApiResponseItems<T> }

export interface ApiResponse<T = unknown, TCollectionKey extends string = never> {
  data: {
    items: ApiResponseItems<T>
    meta?: Meta
  } & ApiResponseCollection<T, TCollectionKey>
  message: string 
  status: 'success' | 'fail' | 'error' 
}
export interface ApiResponseBase<T = unknown> {
  data: T
  message: string 
  status: 'success' | 'fail' | 'error' 
}


export type ApiErrorBody = ApiResponse<null>
export type ApiAxiosError = AxiosError<ApiErrorBody>

export interface NormalizedHttpError {
  status?: number
  statusText?: string
  message: string
  body?: ApiErrorBody
  url?: string
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders
}

export function isApiAxiosError(err: unknown): err is ApiAxiosError {
  return !!err && typeof err === 'object' && 'isAxiosError' in (err as any)
}

export function toNormalizedHttpError(err: unknown): NormalizedHttpError {
  if (isApiAxiosError(err)) {
    const res = err.response
    const body = res?.data
    const message = body?.message ?? err.message ?? 'Unexpected error'

    return {
      status: res?.status,
      statusText: res?.statusText,
      message,
      body,
      url: (res?.config as any)?.url || (res?.request as any)?.responseURL,
      headers: res?.headers,
    }
  }
  return {
    message:
      typeof err === 'object' &&
      err &&
      'message' in err &&
      typeof (err as any).message === 'string'
        ? (err as any).message
        : 'Unexpected error',
  }
}
export interface Links {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface MetaLink {
  url: string | null
  label: string
  active: boolean
}

export interface Meta {
  page?: number
  limit?: number
  total: number
  total_pages?: number
  has_next_page?: boolean
  has_previous_page?: boolean
  current_page?: number
  from?: number
  last_page?: number
  links?: MetaLink[]
  path?: string
  per_page?: number
  to?: number
}

// Re-export shared pagination types from @ecommerce/http for new code
export type {
  PaginationMeta,
  PaginationLinks,
  PaginationLink,
  EntityResponse,
  ListResponse,
} from '@ecommerce/http'
