# Server Fetch

Use `serverJson` or `api` from `@/lib/server/fetch` in Server Components,
server actions, route handlers, and other server-only modules.

```ts
import { api, cacheTag } from "@/lib/server/fetch"

const product = await api.get<Product>("/products/1", {
  cache: "force-cache",
  revalidate: 60,
  tags: [cacheTag("product", 1)],
  timeoutMs: 10_000,
  retries: 2,
})
```

Relative URLs use `process.env.API_BASE_URL` by default. Pass `baseUrl` only
when a request should target a different origin.

The wrapper supports:

- `timeoutMs` with `AbortController`
- exponential retry delays for transient HTTP/network failures
- default `API_BASE_URL` for relative URLs
- explicit `cache?: RequestCache`
- Next.js `revalidate` and cache `tags`
- query params through `query`
- typed JSON responses
- `HttpError` with `status`, `statusText`, `url`, and parsed error payload

Use `backendGet`, `backendPost`, `backendPut`, `backendPatch`, and
`backendDelete` from `@/lib/server/backend` when a request may need the current
NextAuth access token.
