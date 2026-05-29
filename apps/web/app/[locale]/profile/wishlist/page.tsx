import * as React from "react"
import { ProductCard, type Product } from "@/components/product/product-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@ecommerce/ui/components/empty"
import { Button } from "@ecommerce/ui/components/button"
import Link from "next/link"

const MOCK_WISHLIST: Product[] = [
  {
    id: "wishlist-1",
    name: "Noise Pulse Go Buzz",
    brand: "Noise",
    description: "Layer'r Wottagirl Vanilla twist...",
    price: 225.00,
    oldPrice: 249.00,
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=500&q=80",
    rating: 4.5,
    gender: "unisex",
    display: "amoled",
    screen: "1.83",
    shape: "square",
    color: "pink",
    badge: "New",
  },
  {
    id: "wishlist-2",
    name: "Noise ColorFit",
    brand: "Noise",
    description: "Layer'r Wottagirl Vanilla twist...",
    price: 225.00,
    oldPrice: 249.00,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80",
    rating: 4.5,
    gender: "unisex",
    display: "amoled",
    screen: "1.83",
    shape: "square",
    color: "black",
  },
  {
    id: "wishlist-3",
    name: "Noise ColorFit Pro",
    brand: "Noise",
    description: "Layer'r Wottagirl Vanilla twist...",
    price: 225.00,
    oldPrice: 249.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    rating: 4.5,
    gender: "unisex",
    display: "amoled",
    screen: "1.83",
    shape: "square",
    color: "blue",
    badge: "New",
  }
]

export default function WishlistPage() {
  // Toggle this to MOCK_WISHLIST to see items
  const items: Product[] = []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
      
      {items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-muted/50 mb-4 text-muted-foreground">
              <HugeiconsIcon icon={FavouriteIcon} className="size-8" strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle className="text-xl">Your wishlist is empty</EmptyTitle>
            <EmptyDescription>
              Start saving your favorite items. We have something special waiting for you!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="mt-4 rounded-xl px-8 h-11 bg-primary hover:bg-primary/90">
              <Link href="/collections">Continue Shopping</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} view="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
