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
import { HttpError } from "@/lib/server/fetch"
import { cacheTags } from "@/lib/server/cache-tags"

type ClientApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ClientApiRoute = {
  backendPath: string
  methods: ClientApiMethod[]
  privateData?: boolean
  requireAuth?: boolean
  revalidate?: BackendOptions["revalidate"]
  tags?: string[]
}

const clientApiRoutes: Record<string, ClientApiRoute> = {
  products: {
    backendPath: "/client/products",
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
    backendPath: "/client/products/:id",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.products],
  },
  "products/:id/related": {
    backendPath: "/client/products/:id/related",
    methods: ["GET"],
    revalidate: 0,
  },
  "reviews/products/:id": {
    backendPath: "/client/reviews/products/:id",
    methods: ["GET"],
    revalidate: 0,
  },
  "reviews/products/:id/me": {
    backendPath: "/client/reviews/products/:id/me",
    methods: ["GET"],
    privateData: true,
    requireAuth: true,
  },
  reviews: {
    backendPath: "/client/reviews",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  "reviews/:id": {
    backendPath: "/client/reviews/:id",
    methods: ["PUT", "DELETE"],
    privateData: true,
    requireAuth: true,
  },
  categories: {
    backendPath: "/categories",
    methods: ["GET"],
    revalidate: 300,
    tags: [cacheTags.categories],
  },
  collections: {
    backendPath: "/client/collections",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.categories],
  },
  "collections/tree": {
    backendPath: "/client/collections/tree",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.categories],
  },
  "collections/slug/:slug": {
    backendPath: "/client/collections/slug/:slug",
    methods: ["GET"],
    revalidate: 60,
    tags: [cacheTags.categories],
  },
  countries: {
    backendPath: "/client/countries",
    methods: ["GET"],
    revalidate: 300,
  },
  cities: {
    backendPath: "/client/cities",
    methods: ["GET"],
    revalidate: 300,
  },
  "profile/addresses": {
    backendPath: "/client/profile/addresses",
    methods: ["GET", "POST"],
    privateData: true,
    requireAuth: true,
  },
  "profile/addresses/:id": {
    backendPath: "/client/profile/addresses/:id",
    methods: ["PUT", "DELETE"],
    privateData: true,
    requireAuth: true,
  },
  "profile/addresses/:id/default": {
    backendPath: "/client/profile/addresses/:id/default",
    methods: ["PUT"],
    privateData: true,
    requireAuth: true,
  },
  orders: {
    backendPath: "/client/orders",
    methods: ["GET"],
    privateData: true,
    requireAuth: true,
  },
  "orders/:id": {
    backendPath: "/client/orders/:id",
    methods: ["GET"],
    privateData: true,
    requireAuth: true,
  },
  "orders/:id/cancel": {
    backendPath: "/client/orders/:id/cancel",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  returns: {
    backendPath: "/client/returns",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  exchanges: {
    backendPath: "/client/exchanges",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  "checkout/preview": {
    backendPath: "/client/checkout/preview",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  "checkout/place-order": {
    backendPath: "/client/checkout/place-order",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
    tags: [cacheTags.cart],
  },
  "checkout/verify-payment": {
    backendPath: "/client/checkout/verify-payment",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
    tags: [cacheTags.cart],
  },
  cart: {
    backendPath: "/client/cart",
    methods: ["GET", "DELETE"],
    privateData: true,
    tags: [cacheTags.cart],
  },
  "cart/items": {
    backendPath: "/client/cart/items",
    methods: ["POST"],
    privateData: true,
    tags: [cacheTags.cart],
  },
  "cart/items/:id": {
    backendPath: "/client/cart/items/:id",
    methods: ["PATCH", "DELETE"],
    privateData: true,
    tags: [cacheTags.cart],
  },
  wishlist: {
    backendPath: "/client/wishlist",
    methods: ["GET", "POST"],
    privateData: true,
    tags: [cacheTags.wishlist],
  },
  me: {
    backendPath: "/me",
    methods: ["GET"],
    requireAuth: true,
    tags: [cacheTags.currentUser],
  },
  profile: {
    backendPath: "/client/profile",
    methods: ["GET"],
    requireAuth: true,
    tags: [cacheTags.currentUser],
  },
  "notifications/unread-count": {
    backendPath: "/client/notifications/unread-count",
    methods: ["GET"],
    requireAuth: true,
    revalidate: 0,
  },
  notifications: {
    backendPath: "/client/notifications",
    methods: ["GET"],
    requireAuth: true,
    revalidate: 0,
  },
  "notifications/read-all": {
    backendPath: "/client/notifications/read-all",
    methods: ["PATCH"],
    privateData: true,
    requireAuth: true,
  },
  "notifications/:id/read": {
    backendPath: "/client/notifications/:id/read",
    methods: ["PATCH"],
    privateData: true,
    requireAuth: true,
  },
  wallet: {
    backendPath: "/client/wallet",
    methods: ["GET"],
    privateData: true,
    requireAuth: true,
  },
  "wallet/transactions": {
    backendPath: "/client/wallet/transactions",
    methods: ["GET"],
    privateData: true,
    requireAuth: true,
  },
  "wallet/deposits": {
    backendPath: "/client/wallet/deposits",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
  },
  "wallet/withdrawals": {
    backendPath: "/client/wallet/withdrawals",
    methods: ["GET", "POST"],
    privateData: true,
    requireAuth: true,
  },
  "wallet/withdrawals/:id/cancel": {
    backendPath: "/client/wallet/withdrawals/:id/cancel",
    methods: ["POST"],
    privateData: true,
    requireAuth: true,
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

  const productRelatedMatch = path.match(/^products\/([^/]+)\/related$/)
  if (productRelatedMatch) {
    const route = clientApiRoutes["products/:id/related"]
    return { backendPath: route.backendPath.replace(":id", productRelatedMatch[1]), route }
  }

  const reviewMineMatch = path.match(/^reviews\/products\/([^/]+)\/me$/)
  if (reviewMineMatch) {
    const route = clientApiRoutes["reviews/products/:id/me"]
    return { backendPath: route.backendPath.replace(":id", reviewMineMatch[1]), route }
  }

  const productReviewsMatch = path.match(/^reviews\/products\/([^/]+)$/)
  if (productReviewsMatch) {
    const route = clientApiRoutes["reviews/products/:id"]
    return { backendPath: route.backendPath.replace(":id", productReviewsMatch[1]), route }
  }

  const reviewMatch = path.match(/^reviews\/([^/]+)$/)
  if (reviewMatch) {
    const route = clientApiRoutes["reviews/:id"]
    return { backendPath: route.backendPath.replace(":id", reviewMatch[1]), route }
  }

  const collectionSlugMatch = path.match(/^collections\/slug\/([^/]+)$/)
  if (collectionSlugMatch) {
    const route = clientApiRoutes["collections/slug/:slug"]
    return {
      backendPath: route.backendPath.replace(":slug", collectionSlugMatch[1]),
      route,
    }
  }

  const cartItemMatch = path.match(/^cart\/items\/([^/]+)$/)
  if (cartItemMatch) {
    const route = clientApiRoutes["cart/items/:id"]
    return {
      backendPath: route.backendPath.replace(":id", cartItemMatch[1]),
      route,
    }
  }

  const addressDefaultMatch = path.match(
    /^profile\/addresses\/([^/]+)\/default$/
  )
  if (addressDefaultMatch) {
    const route = clientApiRoutes["profile/addresses/:id/default"]
    return {
      backendPath: route.backendPath.replace(":id", addressDefaultMatch[1]),
      route,
    }
  }

  const addressMatch = path.match(/^profile\/addresses\/([^/]+)$/)
  if (addressMatch) {
    const route = clientApiRoutes["profile/addresses/:id"]
    return {
      backendPath: route.backendPath.replace(":id", addressMatch[1]),
      route,
    }
  }

  const orderMatch = path.match(/^orders\/([^/]+)$/)
  if (orderMatch) {
    const route = clientApiRoutes["orders/:id"]
    return {
      backendPath: route.backendPath.replace(":id", orderMatch[1]),
      route,
    }
  }

  const orderCancelMatch = path.match(/^orders\/([^/]+)\/cancel$/)
  if (orderCancelMatch) {
    const route = clientApiRoutes["orders/:id/cancel"]
    return {
      backendPath: route.backendPath.replace(":id", orderCancelMatch[1]),
      route,
    }
  }

  const withdrawalCancelMatch = path.match(
    /^wallet\/withdrawals\/([^/]+)\/cancel$/
  )
  if (withdrawalCancelMatch) {
    const route = clientApiRoutes["wallet/withdrawals/:id/cancel"]
    return {
      backendPath: route.backendPath.replace(":id", withdrawalCancelMatch[1]),
      route,
    }
  }

  const notificationReadMatch = path.match(/^notifications\/([^/]+)\/read$/)
  if (notificationReadMatch) {
    const route = clientApiRoutes["notifications/:id/read"]
    return {
      backendPath: route.backendPath.replace(":id", notificationReadMatch[1]),
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
    cache: method === "GET" && !route.privateData ? "force-cache" : "no-store",
    query: searchParamsToQuery(searchParams),
    requireAuth: route.requireAuth,
    revalidate: method === "GET" && !route.privateData ? route.revalidate : 0,
    retries: method === "GET" ? undefined : 0,
    tags: route.tags,
  }

  try {
    const data = await callBackend(method, match.backendPath, body, options)

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

export { clientApiRoutes, proxyClientApiRequest }
