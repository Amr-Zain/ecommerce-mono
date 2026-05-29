"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, StarIcon, InformationCircleIcon, Copy01Icon, Exchange01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@ecommerce/ui/components/empty"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ReturnsPage() {
  const items: any[] = [] // Empty to demonstrate empty state

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">Returns & Refunds</h1>
      
      {items.length === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-muted/50 mb-4 text-muted-foreground">
              <HugeiconsIcon icon={Exchange01Icon} className="size-8" strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle className="text-xl">No returns or refunds</EmptyTitle>
            <EmptyDescription>
              You don't have any returned items or active refund requests at the moment.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className="mt-4 rounded-xl px-8 h-11 bg-primary hover:bg-primary/90">
              <Link href="/profile/orders">View My Orders</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Product Box */}
          <div className="flex flex-col gap-6 rounded-xl border bg-card p-5 sm:flex-row">
        {/* Image */}
        <div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-lg bg-muted/60 flex items-center justify-center p-0">
          <button className="absolute top-2.5 end-2.5 z-10 text-muted-foreground hover:text-foreground transition-all">
            <HugeiconsIcon icon={FavouriteIcon} className="size-4.5" strokeWidth={2} />
          </button>
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
            alt="Bewakoof T-shirt"
            width={160}
            height={200}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 font-semibold rounded-full px-2.5 py-0.5 text-[10px]">
                  Returned & Fully Refunded
                </Badge>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <span className="font-mono">#INV00010292</span>
                <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground">Order ID: XYZ-42324234</p>
              <h3 className="mt-2 text-base font-bold text-foreground">Bewakoof</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                A sleek rectangular smartwatch featuring a large 1.95" HD display and a slim, lightweight design. Ideal for everyday wear, it offers essential fitness and health tracking along with smart notifications, making it a perfect blend of style and functionality for daily use.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="text-foreground">Size: <span className="font-normal text-muted-foreground">M</span></span>
              <span className="text-foreground">Qty: <span className="font-normal text-muted-foreground">1</span></span>
              <span className="text-foreground">Color: <span className="font-normal text-muted-foreground">pink</span></span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">$225.00</span>
            <span className="text-xs text-muted-foreground line-through">$249.00</span>
          </div>
        </div>
      </div>

      {/* Return Progressed */}
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <h3 className="text-sm font-bold">Return Progressed</h3>
        
        {/* Progress Timeline */}
        <div className="relative flex items-center justify-between max-w-md w-full pt-2 pb-6">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-emerald-500/20" />
          <div className="absolute top-4 left-4 w-full h-0.5 bg-emerald-500" />
          
          {[
            { label: "Delivered", date: "Sept 21, 2023" },
            { label: "Return", date: "Sept 25, 2023" },
            { label: "Refund", date: "Sept 27, 2023" },
          ].map((step, idx) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-4 ring-background">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold">{step.label}</div>
                <div className="text-[10px] text-muted-foreground">{step.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Refund Details */}
        <div className="space-y-4">
          <div className="text-sm font-bold">Total refund $ 225.00</div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 border">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded bg-background border">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7.5" cy="12" r="4.5" className="fill-rose-600" />
                  <circle cx="16.5" cy="12" r="4.5" className="fill-amber-500" />
                </svg>
              </div>
              <span className="text-sm font-semibold">$ 225.00</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <Badge variant="outline" className="bg-primary text-primary-foreground rounded-full border-0 px-3 hover:bg-primary/90">
              Completed
            </Badge>
          </div>
        </div>
      </div>

      {/* Rate your experience */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold">Rate your experience</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Product Quality", rating: 0 },
            { label: "Delivery Experience", rating: 0 },
            { label: "Refund Process", rating: 0 },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-5">
              <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HugeiconsIcon 
                    key={star} 
                    icon={StarIcon} 
                    className="size-5 text-muted-foreground/30 hover:text-amber-400 cursor-pointer transition-colors" 
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-muted-foreground" />
          <span className="text-sm font-semibold">Need any help?</span>
        </div>
        <Button className="h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4">
            Contact Support
          </Button>
        </div>
        </>
      )}
    </div>
  )
}
