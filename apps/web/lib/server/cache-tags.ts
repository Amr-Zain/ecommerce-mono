import "server-only"

import { revalidateTag } from "next/cache"

const cacheTags = {
  cart: "cart",
  categories: "categories",
  currentUser: "current-user",
  orders: "orders",
  products: "products",
  wishlist: "wishlist",
} as const

type CacheTag = (typeof cacheTags)[keyof typeof cacheTags]

function productTag(id: string) {
  return `${cacheTags.products}:${id}` as const
}

function revalidateCacheTag(tag: CacheTag | ReturnType<typeof productTag>) {
  revalidateTag(tag, "max")
}

function revalidateCacheTags(
  tags: Array<CacheTag | ReturnType<typeof productTag>>
) {
  for (const tag of tags) {
    revalidateCacheTag(tag)
  }
}

export { cacheTags, productTag, revalidateCacheTag, revalidateCacheTags }
export type { CacheTag }
