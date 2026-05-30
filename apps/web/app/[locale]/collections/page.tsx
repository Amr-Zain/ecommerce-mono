import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"

// MOCK DATA
const ELECTRONICS = [
  { name: "Smart Watches", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80" },
  { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
  { name: "Speakers", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=300&q=80" },
  { name: "Television", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80" },
]

const BEAUTY = [
  { name: "Skincare Routine Kit", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=300&q=80" },
  { name: "Natural Glow Powder", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80" },
  { name: "Micellar Water", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=300&q=80" },
  { name: "Rice & Sake Sleep Mask", image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=300&q=80" },
]

const CLOTHING = [
  { name: "Women's Western Wear", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" },
  { name: "Men's T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80" },
  { name: "Ethnic Collections", image: "https://images.unsplash.com/photo-1583391733958-d15a3928155e?auto=format&fit=crop&w=300&q=80" },
  { name: "Winter Essentials", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80" },
]

const DEALS = [
  { title: "Up To", value: "70%", sub: "off" },
  { title: "Minimum", value: "50%", sub: "off" },
  { title: "Flat", value: "60%", sub: "off" },
  { title: "Cash Back", value: "20%", sub: "off" },
]

// REUSABLE SECTION HEADER
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="flex gap-2">
        <button className="flex size-7 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
        </button>
        <button className="flex size-7 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      
      {/* 1. Hero Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-muted flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border border-foreground/5">
        <div className="flex-1 space-y-4 max-w-lg z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
            Samsung Galaxy M06 5G Mobile
          </h1>
          <p className="text-sm font-semibold text-foreground/70 max-w-sm">
            Monster processor - Segment Leading MediaTek Dimensity 8300, AnTuTu Score 422K+, Latest Android 15 Operating System.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-background text-foreground font-bold text-xs px-5 py-2.5 rounded-full hover:bg-background/90 transition-all shadow-sm">
            See What's New <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
        <div className="relative w-full md:w-1/2 h-64 md:h-80 mt-8 md:mt-0 flex justify-end">
          <Image
            src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"
            alt="Samsung Galaxy M06"
            fill
            className="object-contain object-right transform scale-125 md:scale-150 origin-right translate-x-12"
          />
        </div>
      </div>

      {/* 2. Electronics Categories */}
      <section>
        <SectionHeader title="Electronics Categories" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {ELECTRONICS.map((item, idx) => (
            <Link key={idx} href={`/collections/electronics`} className="group flex flex-col gap-3">
              <div className="aspect-square relative rounded-xl bg-muted/30 overflow-hidden p-6 border border-transparent transition-all group-hover:border-foreground/20 group-hover:shadow-sm">
                <Image src={item.image} alt={item.name} fill className="object-contain p-6 dark:mix-blend-normal mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
              </div>
              <span className="text-xs font-bold text-foreground text-center">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Deals on Electronics */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-amber-500">⚡</span> Deals on Electronics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEALS.map((deal, idx) => (
            <Link key={idx} href="/products" className="flex flex-col items-center justify-center rounded-xl bg-muted/40 p-6 border border-transparent hover:border-foreground/20 transition-all hover:bg-muted/60">
              <span className="text-sm font-bold text-foreground">{deal.title}</span>
              <span className="text-4xl font-black text-foreground tracking-tighter mt-1">{deal.value}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{deal.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Promotional Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-secondary p-8 flex flex-col md:flex-row items-center border border-foreground/5">
        <div className="flex-1 space-y-4 max-w-md z-10">
          <h2 className="text-3xl font-extrabold text-foreground">Hurry Up! 40% Off on Everything</h2>
          <p className="text-xs font-bold text-foreground/70">
            Limited-time sale on trending products. Don't wait since it's gone, it's gone.
          </p>
          
          <div className="pt-2">
            <p className="text-[10px] font-bold text-foreground/60 uppercase mb-2">Offer expires in:</p>
            <div className="flex gap-2">
              {['1', '14', '43', '06'].map((num, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="bg-background rounded border border-foreground/10 px-2.5 py-1.5 text-sm font-bold text-foreground min-w-[32px] text-center">
                    {num}
                  </div>
                  <span className="text-[9px] font-bold text-foreground/50 uppercase">{['Day', 'Hours', 'Min', 'Sec'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Link href="/products" className="inline-flex items-center gap-2 bg-foreground text-background font-bold text-xs px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-all shadow-sm mt-2">
            Shop now <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 h-full w-1/2">
           <Image
            src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=800&q=80"
            alt="Excited Man"
            fill
            className="object-cover object-left mask-image-gradient"
          />
        </div>
      </div>

      {/* 5. Beauty & Skincare */}
      <section>
        <SectionHeader title="Beauty & Skincare" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {BEAUTY.map((item, idx) => (
            <Link key={idx} href={`/collections/beauty`} className="group flex flex-col gap-3">
              <div className="aspect-square relative rounded-xl bg-muted/30 overflow-hidden border border-transparent transition-all group-hover:border-foreground/20 group-hover:shadow-sm">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xs font-bold text-foreground text-center line-clamp-1 px-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Category in Clothing */}
      <section>
        <SectionHeader title="Category in Clothing" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {CLOTHING.map((item, idx) => (
            <Link key={idx} href={`/collections/clothing`} className="group flex flex-col gap-3">
              <div className="aspect-square relative rounded-xl bg-muted/30 overflow-hidden border border-transparent transition-all group-hover:border-foreground/20 group-hover:shadow-sm">
                <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-xs font-bold text-foreground text-center line-clamp-1 px-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
