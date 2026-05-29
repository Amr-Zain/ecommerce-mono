import * as React from "react"
import { ProductCard, type Product } from "@/components/product/product-card"

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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_WISHLIST.map((product) => (
          <ProductCard key={product.id} product={product} view="grid" />
        ))}
      </div>
    </div>
  )
}
