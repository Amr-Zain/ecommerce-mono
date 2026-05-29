# API Hooks

Use custom hooks from this folder in client components.

- `useFetch` and `useMutate` are generic TanStack Query wrappers.
- Domain hooks like `useProducts`, `useCart`, and `useWishlist` hide endpoint
  strings and query keys from UI components.
- Default endpoints call local `/api/client/...` route handlers.
- Use `customBaseUrl` only for browser-safe public backend endpoints.

Mutations can invalidate client cache keys:

```ts
useMutate({
  endpoint: "/api/client/cart",
  mutationKey: ["cart", "add"],
  mutationOptions: {
    meta: {
      invalidates: [["cart"]],
    },
  },
})
```
