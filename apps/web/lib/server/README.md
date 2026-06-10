# Server Fetch

Use the backend helpers from `@/lib/server/backend` in Server Components,
server actions, route handlers, and other server-only modules. This ensures
every API request passes through `withAuthHeaders`.

```ts
import { backendGet } from "@/lib/server/backend"
import { cacheTag } from "@/lib/server/fetch"

const product = await backendGet<Product>("/products/1", {
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

`serverFetch`, `serverJson`, and `api` are low-level transport primitives used
by the backend helpers. Do not call them directly from application code.

`withAuthHeaders` is the single server-side API header policy. It applies
`Accept`, `Accept-Language`, and `X-Platform`, and can add an explicit access
token, the current NextAuth access token, or incoming cookies. `Content-Type`
remains body-dependent in the low-level serializer so multipart requests keep
their generated boundary.

## Authentication

Client OTP requests call the API `/auth/*` controller through server actions.
The verification action copies the API refresh token into an HttpOnly cookie.

After `/auth/login-otp` returns an access token, NextAuth validates that token
against `/auth/me` before creating its session. The refresh token is never
exposed to React components, hooks, server actions, or the NextAuth JWT.
