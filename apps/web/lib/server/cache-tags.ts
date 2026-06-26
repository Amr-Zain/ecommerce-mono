import "server-only"

import { revalidateTag, updateTag } from "next/cache"

const cacheTags = {
  cart: "cart",
  categories: "categories",
  currentUser: "current-user",
  orders: "orders",
  products: "products",
  staticPages: "static-pages",
  wishlist: "wishlist",
} as const

type CacheTag = (typeof cacheTags)[keyof typeof cacheTags]

function productTag(id: string) {
  return `${cacheTags.products}:${id}` as const
}

function staticPageTag(slug: string) {
  return `${cacheTags.staticPages}:${slug}` as const
}

function revalidateCacheTag(tag: CacheTag | ReturnType<typeof productTag> | ReturnType<typeof staticPageTag>) {
  revalidateTag(tag, "max")
}

function revalidateCacheTags(
  tags: Array<CacheTag | ReturnType<typeof productTag> | ReturnType<typeof staticPageTag>>
) {
  for (const tag of tags) {
    revalidateCacheTag(tag)
  }
}

function invalidateCacheTags(
  tags: Array<CacheTag | ReturnType<typeof productTag> | ReturnType<typeof staticPageTag>>
) {
  for (const tag of tags) {
    updateTag(tag)
  }
}

export {
  cacheTags,
  invalidateCacheTags,
  productTag,
  revalidateCacheTag,
  revalidateCacheTags,
  staticPageTag,
}
export type { CacheTag }
