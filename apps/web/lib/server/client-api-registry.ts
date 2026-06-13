import "server-only"

import {
  backendDelete,
  backendGet,
  backendPatch,
  backendPost,
  backendPut,
  publicBackendGet,
  type BackendOptions,
} from "@/lib/server/backend"
import {
  cacheTags,
  productTag,
  revalidateCacheTags,
} from "@/lib/server/cache-tags"
import type { RequestBody } from "@/lib/server/fetch"
import { HttpError } from "@/lib/server/fetch"

type ClientApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type PublicCachePolicy = {
  matches: (path: string) => boolean
  revalidate: number
  tags: (path: string) => string[]
}

const exact = (expected: string) => (path: string) => path === expected
const pattern = (expression: RegExp) => (path: string) => expression.test(path)

const publicCachePolicies: PublicCachePolicy[] = [
  {
    matches: exact("products"),
    revalidate: 60,
    tags: () => [cacheTags.products],
  },
  {
    matches: pattern(/^products\/[^/]+$/),
    revalidate: 60,
    tags: (path) => [cacheTags.products, productTag(path.split("/")[1])],
  },
  {
    matches: pattern(/^products\/[^/]+\/related$/),
    revalidate: 60,
    tags: () => [cacheTags.products],
  },
  {
    matches: pattern(/^collections(?:\/tree|\/slug\/[^/]+|\/[^/]+)?$/),
    revalidate: 60,
    tags: () => [cacheTags.categories],
  },
  {
    matches: pattern(/^(?:countries|cities|attributes|static-pages|show-rooms)(?:\/[^/]+)?$/),
    revalidate: 300,
    tags: () => [],
  },
  {
    matches: pattern(/^(?:home|sliders|faqs)$/),
    revalidate: 60,
    tags: () => [],
  },
]

function invalidatePublicCaches(method: ClientApiMethod, path: string) {
  if (method !== "GET" && /^reviews(?:\/[^/]+)?$/.test(path)) {
    revalidateCacheTags([cacheTags.products])
  }
}

function getPublicCachePolicy(path: string) {
  return publicCachePolicies.find((policy) => policy.matches(path))
}

function normalizeClientPath(path: string) {
  const segments = path.split("/")

  if (
    !segments.length ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("\\")
    )
  ) {
    return null
  }

  return segments.map(encodeURIComponent).join("/")
}

async function proxyClientApiRequest({
  body,
  method,
  path,
  searchParams,
}: {
  body?: RequestBody
  method: ClientApiMethod
  path: string
  searchParams: URLSearchParams
}) {
  const normalizedPath = normalizeClientPath(path)

  if (!normalizedPath) {
    return Response.json({ message: "Not found" }, { status: 404 })
  }

  const backendPath = `/client/${normalizedPath}`
  const publicPolicy =
    method === "GET" ? getPublicCachePolicy(normalizedPath) : undefined
  const options: BackendOptions = {
    cache: publicPolicy ? "force-cache" : "no-store",
    query: searchParamsToQuery(searchParams),
    retries: method === "GET" ? undefined : 0,
    revalidate: publicPolicy?.revalidate ?? 0,
    tags: publicPolicy?.tags(normalizedPath),
  }

  try {
    const data =
      publicPolicy && method === "GET"
        ? await publicBackendGet(backendPath, options)
        : await callBackend(method, backendPath, body, options)

    invalidatePublicCaches(method, normalizedPath)

    return Response.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    if (error instanceof HttpError) {
      return Response.json(error.payload ?? { message: error.message }, {
        status: error.status,
      })
    }

    const message =
      error instanceof Error ? error.message : "Backend request failed"

    return Response.json(
      { message },
      { status: error instanceof TypeError ? 503 : 500 }
    )
  }
}

function searchParamsToQuery(searchParams: URLSearchParams) {
  const query: Record<string, string | string[]> = {}
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key)
    query[key] = values.length > 1 ? values : values[0]
  }
  return query
}

function callBackend(
  method: ClientApiMethod,
  path: string,
  body: RequestBody | undefined,
  options: BackendOptions
) {
  switch (method) {
    case "GET":
      return backendGet(path, options)
    case "POST":
      return backendPost(path, body, options)
    case "PUT":
      return backendPut(path, body, options)
    case "PATCH":
      return backendPatch(path, body, options)
    case "DELETE":
      return backendDelete(path, options)
  }
}

export { proxyClientApiRequest, publicCachePolicies }
