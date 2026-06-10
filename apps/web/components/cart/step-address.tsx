"use client"

import { ArrowLeft01Icon, CheckmarkCircle01Icon, Location01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { PricingSummary, type Pricing } from "@/components/cart/step-cart"
import {
  locationName,
  useAddresses,
  useCities,
  useCountries,
  useCreateAddress,
} from "@/hooks/api/use-checkout"
import { cn } from "@/lib/utils"

interface AddressStepProps {
  pricing: Pricing
  selectedId: string
  previewPending: boolean
  onBack: () => void
  onNext: () => void
  onSelect: (id: string) => void
}

export function AddressStep({
  pricing,
  selectedId,
  previewPending,
  onBack,
  onNext,
  onSelect,
}: AddressStepProps) {
  const addresses = useAddresses()
  const countries = useCountries()
  const createAddress = useCreateAddress()
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    address: "",
    streetName: "",
    buildingNumber: "",
    countryId: "",
    cityId: "",
  })
  const cities = useCities(form.countryId)

  const saveAddress = () => {
    const countryId = Number(form.countryId)
    const cityId = Number(form.cityId)
    if (!Number.isSafeInteger(countryId) || countryId <= 0 || !Number.isSafeInteger(cityId) || cityId <= 0) {
      return
    }

    createAddress.mutate(
      {
        address: form.address,
        streetName: form.streetName || undefined,
        buildingNumber: form.buildingNumber || undefined,
        countryId,
        cityId,
        isDefault: (addresses.data?.length ?? 0) === 0,
      },
      {
        onSuccess: (response) => {
          const created = response as { data?: { id?: string } }
          if (created.data?.id) onSelect(String(created.data.id))
          setIsAddOpen(false)
          setForm({ address: "", streetName: "", buildingNumber: "", countryId: "", cityId: "" })
        },
      }
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Select Delivery Address</h2>
          <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
            Add New
          </button>
        </div>

        {addresses.isPending ? (
          <p className="text-sm text-muted-foreground">Loading addresses...</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(addresses.data ?? []).map((address) => {
              const selected = address.id === selectedId
              return (
                <button
                  key={address.id}
                  onClick={() => onSelect(address.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left",
                    selected ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  {selected && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="absolute end-4 top-4 size-5 text-primary" />}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Location01Icon} className="size-5" />
                    <span className="font-bold">{address.street_name || "Delivery Address"}</span>
                    {address.is_default && <Badge variant="outline">Default</Badge>}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {[address.building_number, address.address, locationName(address.city), locationName(address.country)]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          Back to Cart
        </button>
      </div>

      <PricingSummary
        pricing={pricing}
        onNext={onNext}
        actionLabel={previewPending ? "Calculating..." : "Continue to Payment"}
        disabled={!selectedId || previewPending}
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Add Delivery Address</DialogTitle>
            <DialogDescription>This address will be saved to your profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Street name" value={form.streetName} onChange={(e) => setForm({ ...form, streetName: e.target.value })} />
              <Input placeholder="Building number" value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
            </div>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value, cityId: "" })}>
              <option value="">Select country</option>
              {(countries.data ?? []).map((country) => <option key={country.id} value={country.id}>{locationName(country)}</option>)}
            </select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.cityId} disabled={!form.countryId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
              <option value="">Select city</option>
              {(cities.data ?? []).map((city) => <option key={city.id} value={city.id}>{locationName(city)}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button
              onClick={saveAddress}
              disabled={!form.address || !form.countryId || !form.cityId || createAddress.isPending}
            >
              {createAddress.isPending ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
