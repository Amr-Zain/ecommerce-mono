import "server-only"

import {
  backendDelete,
  backendGet,
  backendPatch,
  backendPost,
  backendPut,
  type BackendOptions,
} from "@/lib/server/backend"
import type { RequestBody } from "@/lib/server/fetch"
import { cacheTags } from "@/lib/server/cache-tags"

type ClientApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ClientApiRoute = {
  backendPath: string
  methods: ClientApiMethod[]
  requireAuth?: boolean
  revalidate?: BackendOptions["revalidate"]
  tags?: string[]
}

const clientApiRoutes: Record<string, ClientApiRoute> = {
  products: {
    backendPath: "/products",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.products],
  },
  "products/search": {
    backendPath: "/products/search",
    methods: ["GET"],
    revalidate: 30,
    tags: [cacheTags.products],
  },
  "products/:id": {
    backendPath: "/products/:id",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.products],
  },
  categories: {
    backendPath: "/categories",
    methods: ["GET"],
    revalidate: 300,
    tags: [cacheTags.categories],
  },
  cart: {
    backendPath: "/cart",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    requireAuth: true,
    tags: [cacheTags.cart],
  },
  wishlist: {
    backendPath: "/wishlist",
    methods: ["GET", "POST", "DELETE"],
    requireAuth: true,
    tags: [cacheTags.wishlist],
  },
  me: {
    backendPath: "/me",
    methods: ["GET"],
    requireAuth: true,
    tags: [cacheTags.currentUser],
  },
} satisfies Record<string, ClientApiRoute>

function getClientApiRoute(path: string) {
  return clientApiRoutes[path as keyof typeof clientApiRoutes]
}

function matchClientApiRoute(path: string) {
  const exact = getClientApiRoute(path)

  if (exact) {
    return {
      backendPath: exact.backendPath,
      route: exact,
    }
  }

  const productMatch = path.match(/^products\/([^/]+)$/)

  if (productMatch) {
    const route = clientApiRoutes["products/:id"]

    return {
      backendPath: route.backendPath.replace(":id", productMatch[1]),
      route,
    }
  }
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
  const match = matchClientApiRoute(path)
  const route = match?.route

  if (!route || !route.methods.includes(method)) {
    return Response.json({ message: "Not found" }, { status: 404 })
  }

  const options: BackendOptions = {
    cache: method === "GET" ? "force-cache" : "no-store",
    query: Object.fromEntries(searchParams.entries()),
    requireAuth: route.requireAuth,
    revalidate: method === "GET" ? route.revalidate : 0,
    tags: route.tags,
  }

  try {
    const data = await callBackend(method, match.backendPath, body, options)

    return Response.json(data)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    const message =
      error instanceof Error ? error.message : "Backend request failed"

    return Response.json({ message }, { status: 500 })
  }
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

export { clientApiRoutes, proxyClientApiRequest }
