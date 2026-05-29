"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon, MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

const MOCK_PRODUCT = {
  id: "XYZ-42324234",
  name: "Bewakoof Smartwatch",
  brand: "Bewakoof",
  description: "A sleek rectangular smartwatch featuring a large 1.95\" HD display and a slim, lightweight design. Ideal for everyday wear, it offers essential fitness and health tracking along with smart notifications, making it a perfect blend of style and functionality for daily use.",
  price: 225.00,
  oldPrice: 249.00,
  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
  rating: 4,
  gender: "unisex",
  display: "amoled",
  screen: "1.95",
  shape: "square",
  color: "pink",
  badge: "Delivered"
}

export default function ExchangeReturnPage() {
  const [activeTab, setActiveTab] = React.useState<"exchange" | "return">("exchange")
  const [reason, setReason] = React.useState("")
  const [selectedSize, setSelectedSize] = React.useState("M")
  const [selectedColor, setSelectedColor] = React.useState("purple")
  const [quantity, setQuantity] = React.useState(1)
  const [refundMethod, setRefundMethod] = React.useState("original")

  return (
    <div className="space-y-8">
      {/* Product Box */}
      <ProductCard product={MOCK_PRODUCT} view="list" hideActions />

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("exchange")}
          className={cn(
            "flex-1 pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "exchange"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Exchange
        </button>
        <button
          onClick={() => setActiveTab("return")}
          className={cn(
            "flex-1 pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "return"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Return
        </button>
      </div>

      {/* Form Content */}
      <div className="space-y-8">
        {/* Reason Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold">Why do you want to {activeTab === "exchange" ? "exchange" : "Return"} this item?</h3>
          <div className="flex flex-wrap items-center gap-6">
            {["Wrong size", "Defective/damaged item", "Wrong item received", "Don't like the product", "Other"].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "size-4 rounded-full border flex items-center justify-center transition-all",
                  reason === item ? "border-foreground border-4" : "border-muted-foreground group-hover:border-foreground"
                )}></div>
                <input
                  type="radio"
                  name="reason"
                  value={item}
                  checked={reason === item}
                  onChange={(e) => setReason(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{item}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold">Reason for {activeTab === "exchange" ? "Exchange" : "Return"}<span className="text-destructive">*</span></label>
            <Textarea
              placeholder={`Briefly describe the reason for ${activeTab === "exchange" ? "exchange" : "return"}`}
              className="min-h-[100px] text-sm resize-y"
            />
          </div>
        </div>

        {/* Exchange Specific Sections */}
        {activeTab === "exchange" && (
          <>
            {/* Sizes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Available sizes</h3>
                <Link href={"#" as any} className="text-xs font-semibold text-blue-500 hover:underline">Size Guide &gt;</Link>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { size: "XS", stock: null },
                  { size: "S", stock: "1 left" },
                  { size: "M", stock: null },
                  { size: "L", stock: "2 left" },
                  { size: "XL", stock: null },
                ].map((item) => (
                  <div key={item.size} className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => setSelectedSize(item.size)}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                        selectedSize === item.size
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {item.size}
                    </button>
                    {item.stock && (
                      <span className="text-[10px] font-semibold text-destructive">{item.stock}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Colors & Quantity */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Available Color</h3>
                <div className="flex items-center gap-2">
                  {[
                    { id: "purple", color: "bg-purple-600" },
                    { id: "lime", color: "bg-lime-400" },
                    { id: "gray", color: "bg-gray-200" },
                    { id: "pink", color: "bg-pink-200" },
                    { id: "mint", color: "bg-emerald-200" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedColor(item.id)}
                      className={cn(
                        "size-6 rounded-full transition-all ring-offset-2",
                        item.color,
                        selectedColor === item.id ? "ring-2 ring-foreground scale-110" : "hover:scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold">Choose the Quantity</h3>
                <div className="flex items-center justify-between w-[120px] rounded-lg border p-1 h-10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all"
                  >
                    <HugeiconsIcon icon={MinusSignIcon} className="size-4" strokeWidth={2} />
                  </button>
                  <span className="text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex size-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-all"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Refund Method (Common, but position varies slightly. Added here for Return tab specifically based on screenshots, and Exchange has it at the bottom) */}
        {activeTab === "return" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold">How do you want to be refunded?</h3>
            <div className="flex flex-wrap items-center gap-6">
              {[
                { id: "original", label: "Original payment method" },
                { id: "giftcard", label: "Gift card" },
                { id: "credit", label: "Credit or Debit card" },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center transition-all",
                    refundMethod === item.id ? "border-foreground border-4" : "border-muted-foreground group-hover:border-foreground"
                  )}></div>
                  <input
                    type="radio"
                    name="refund"
                    value={item.id}
                    checked={refundMethod === item.id}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Pickup Details */}
        <div className="space-y-4 pt-4 border-t border-dashed">
          <h3 className="text-sm font-bold">Pickup Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Country<span className="text-destructive">*</span></label>
              <Select defaultValue="usa">
                <SelectTrigger className="text-xs font-medium h-10">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold">Region/State<span className="text-destructive">*</span></label>
              <Select defaultValue="ca">
                <SelectTrigger className="text-xs font-medium h-10">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="tx">Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold">City<span className="text-destructive">*</span></label>
              <Select defaultValue="la">
                <SelectTrigger className="text-xs font-medium h-10">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="la">Los Angeles</SelectItem>
                  <SelectItem value="sf">San Francisco</SelectItem>
                  <SelectItem value="sd">San Diego</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Post Code<span className="text-destructive">*</span></label>
              <Input defaultValue="90001" className="h-10 text-xs font-medium" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-emerald-500">Your item will be picked up within 2-3 days.</span>
            <Button className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4">
              Save changes
            </Button>
          </div>
        </div>

        {/* Exchange Summary */}
        {activeTab === "exchange" && (
          <div className="rounded-xl border p-5 space-y-3 bg-card/50">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">$599.00</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Discount</span>
              <span className="text-foreground">-$50.00</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Shipment cost</span>
              <span className="text-foreground">$22.50</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t">
              <span>Grand Total</span>
              <span>$571.70</span>
            </div>
          </div>
        )}

        {/* Footer Info & Action */}
        <div className="space-y-6 pt-2">
          {activeTab === "exchange" ? (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                You'll get $00.00 refunded after your returned item is picked up and verified.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold">How do you want to be refunded?</h3>
                <div className="flex flex-wrap items-center gap-6">
                  {[
                    { id: "original", label: "Original payment method" },
                    { id: "giftcard", label: "Gift card" },
                    { id: "credit", label: "Credit or Debit card" },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className={cn(
                        "size-4 rounded-full border flex items-center justify-center transition-all",
                        refundMethod === item.id ? "border-foreground border-4" : "border-muted-foreground group-hover:border-foreground"
                      )}></div>
                      <input
                        type="radio"
                        name="refund"
                        value={item.id}
                        checked={refundMethod === item.id}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        className="hidden"
                      />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">
              You'll get full payment refunded after your returned item is picked up and verified.
            </p>
          )}

          <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Confirm {activeTab === "exchange" ? "Exchange" : "Return"}
          </Button>
        </div>
      </div>
    </div>
  )
}
