import {
  CreditCardIcon,
  DeliveryReturn01Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type Product = {
  id?: string
  name: string
  brand: string
  description?: string
  price: string
  oldPrice?: string
  badge?: string
  badgeTone?: "default" | "destructive"
  image: string
  imageClassName?: string
  firstVariationId?: string
}

export type Category = {
  id?: string
  slug?: string
  name: string
  image: string
  background: string
}

export type Benefit = {
  icon: IconSvgElement
  title: string
  copy: string
}

export const heroPromos = [
  {
    title: "Macbook m4 pro",
    copy: "Enjoy stunning picture clarity, immersive sound, and smart features designed to elevate your everyday entertainment.",
    cta: "Purchase Now",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=680&q=85",
    className: "bg-muted",
  },
  {
    title: "AirPods Max",
    copy: "AirPods Max deliver stunningly detailed, high-fidelity audio for an unparalleled listening experience.",
    cta: "Get Now",
    image:
      "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&w=680&q=85",
    className: "bg-secondary",
    featured: true,
  },
]

export const sidePromos = [
  {
    title: "Flat 20% Off on Regular Shoes",
    cta: "Claim Discount",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=460&q=85",
    className: "bg-accent",
  },
  {
    title: "Discover Deals That Define Your",
    cta: "Explore More",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=460&q=85",
    className: "bg-muted",
  },
]

export const categories: Category[] = [
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=220&q=85",
    background: "bg-muted",
  },
  {
    name: "Beauty Products",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=220&q=85",
    background: "bg-secondary",
  },
  {
    name: "Smart Watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=220&q=85",
    background: "bg-muted",
  },
  {
    name: "Home Decor",
    image:
      "https://images.unsplash.com/photo-1490623970972-ae8bb3da443e?auto=format&fit=crop&w=220&q=85",
    background: "bg-accent",
  },
  {
    name: "Kitchen Appliances",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=220&q=85",
    background: "bg-secondary",
  },
  {
    name: "Toys & Games",
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=220&q=85",
    background: "bg-muted",
  },
  {
    name: "Bags & Travel",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=220&q=85",
    background: "bg-secondary",
  },
  {
    name: "Footwear",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=220&q=85",
    background: "bg-accent",
  },
  {
    name: "Audio",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=220&q=85",
    background: "bg-muted",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=220&q=85",
    background: "bg-secondary",
  },
]

export const deals: Product[] = [
  {
    name: "Bellavita",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$225.00",
    oldPrice: "$249.00",
    badge: "New",
    badgeTone: "default",
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=440&q=85",
  },
  {
    name: "Samsung",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$225.00",
    oldPrice: "$249.00",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=440&q=85",
  },
  {
    name: "Milton",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$225.00",
    oldPrice: "$249.00",
    badge: "20% off",
    badgeTone: "destructive",
    image:
      "https://images.unsplash.com/photo-1583947581924-a31a8ac6ed5c?auto=format&fit=crop&w=440&q=85",
  },
  {
    name: "boAt",
    brand: "Wireless earbuds with charging case...",
    price: "$185.00",
    oldPrice: "$230.00",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=440&q=85",
  },
  {
    name: "Fossil",
    brand: "Everyday smart watch with silicone strap...",
    price: "$320.00",
    oldPrice: "$399.00",
    badge: "New",
    badgeTone: "default",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=440&q=85",
  },
]

export const newArrivals: Product[] = [
  {
    name: "Flora",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$580.00",
    oldPrice: "$670.00",
    badge: "New",
    badgeTone: "default",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Bellavita",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$850.00",
    oldPrice: "$940.00",
    image:
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Milton",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$270.00",
    oldPrice: "$320.00",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Bellavita",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$850.00",
    oldPrice: "$940.00",
    badge: "20% off",
    badgeTone: "destructive",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Sony",
    brand: "Noise cancelling wireless headphones...",
    price: "$420.00",
    oldPrice: "$510.00",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Adidas",
    brand: "Lightweight running shoes in black...",
    price: "$125.00",
    oldPrice: "$160.00",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=420&q=85",
  },
]

export const popularProducts: Product[] = [
  {
    name: "LAKME",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$225.00",
    oldPrice: "$249.00",
    badge: "New",
    badgeTone: "default",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Nike",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$580.00",
    oldPrice: "$670.00",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "H&M",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$580.00",
    oldPrice: "$670.00",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "e.l.f.",
    brand: "Layer'r Wottagirl Vanilla Twist...",
    price: "$225.00",
    oldPrice: "$249.00",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Apple",
    brand: "Premium phone with elegant finish...",
    price: "$950.00",
    oldPrice: "$1099.00",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=420&q=85",
  },
  {
    name: "Zara",
    brand: "Everyday cotton shirt with relaxed fit...",
    price: "$70.00",
    oldPrice: "$95.00",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=420&q=85",
  },
]

export const community = [
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=85",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=360&q=85",
]

export const benefits: Benefit[] = [
  {
    icon: DeliveryTruck01Icon,
    title: "Free delivery",
    copy: "Get your orders delivered to your doorstep for free.",
  },
  {
    icon: CreditCardIcon,
    title: "Online Payment",
    copy: "Experience hassle-free online payments with secure.",
  },
  {
    icon: DeliveryReturn01Icon,
    title: "Easy Return",
    copy: "Enjoy easy returns within 30 days of purchase.",
  },
]
