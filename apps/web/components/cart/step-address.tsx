"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, PlusSignIcon, CheckmarkCircle01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Badge } from "@ecommerce/ui/components/badge"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Separator } from "@ecommerce/ui/components/separator"
import { cn } from "@/lib/utils"
import { PricingSummary } from "@/components/cart/step-cart"
import type { Pricing } from "@/components/cart/step-cart"

type Address = {
  id: string
  title: string
  name: string
  address: string
  isDefault: boolean
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: "1",
    title: "Home",
    name: "Carlyle Hall",
    address: "25 Union Square W,\nNew York, NY 10003, USA",
    isDefault: true,
  },
  {
    id: "2",
    title: "Office",
    name: "Parkside Residence",
    address: "18 East 16th Street, Apt 7C\nNew York, NY 10003, USA",
    isDefault: false,
  },
]

interface AddressStepProps {
  pricing: Pricing
  onBack: () => void
  onNext: () => void
}

export function AddressStep({ pricing, onBack, onNext }: AddressStepProps) {
  const [addresses, setAddresses] = React.useState<Address[]>(MOCK_ADDRESSES)
  const [selectedId, setSelectedId] = React.useState<string>(
    MOCK_ADDRESSES.find((a) => a.isDefault)?.id ?? MOCK_ADDRESSES[0]?.id ?? ""
  )
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({ title: "", name: "", address: "" })

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: false,
    }
    setAddresses((prev) => [...prev, newAddress])
    setSelectedId(newAddress.id)
    setIsAddOpen(false)
    setFormData({ title: "", name: "", address: "" })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Address List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Select Delivery Address</h2>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2.5} />
            Add New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedId
            return (
              <button
                key={addr.id}
                onClick={() => setSelectedId(addr.id)}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <span className="absolute top-4 right-4 text-primary">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5" strokeWidth={2} />
                  </span>
                )}

                {/* Icon + title */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <HugeiconsIcon icon={Location01Icon} className="size-5" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-foreground">{addr.title}</span>
                    {addr.isDefault && (
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary bg-primary/10 text-[10px] font-bold rounded-full px-2 py-0"
                      >
                        Default
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Address detail */}
                <div className="space-y-0.5 text-sm pl-0.5">
                  <p className="font-semibold text-foreground">{addr.name}</p>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-xs">
                    {addr.address}
                  </p>
                </div>
              </button>
            )
          })}

          {/* Add new card */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex min-h-[140px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed bg-muted/20 p-5 text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground hover:border-muted-foreground/30"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-background border shadow-sm">
              <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">Add New Address</span>
          </button>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mt-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
          Back to Cart
        </button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <PricingSummary
          pricing={pricing}
          onNext={onNext}
          actionLabel="Continue to Payment"
          disabled={!selectedId}
        />
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Enter your delivery address details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="addr-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="addr-title"
                placeholder="e.g. Home, Office"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="addr-name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="addr-address" className="text-sm font-medium">
                Address
              </label>
              <Textarea
                id="addr-address"
                placeholder="Enter full address..."
                className="resize-none rounded-xl"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAddAddress}
              disabled={!formData.title || !formData.name || !formData.address}
              className="rounded-xl"
            >
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
