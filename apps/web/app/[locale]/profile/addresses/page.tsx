"use client"

import { Location01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ecommerce/ui/components/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { locationName, useAddresses, useCities, useCountries, useCreateAddress, type Address } from "@/hooks/api/use-checkout"
import { useDeleteAddress, useSetDefaultAddress, useUpdateAddress } from "@/hooks/api/use-profile-commerce"

const EMPTY_FORM = { address: "", streetName: "", buildingNumber: "", countryId: "", cityId: "" }

export default function AddressesPage() {
  const addresses = useAddresses()
  const countries = useCountries()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Address | null>(null)
  const [form, setForm] = React.useState(EMPTY_FORM)
  const cities = useCities(form.countryId)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditing(address)
    setForm({
      address: address.address,
      streetName: address.street_name ?? "",
      buildingNumber: address.building_number ?? "",
      countryId: address.country_id ?? address.country?.id ?? "",
      cityId: address.city_id ?? address.city?.id ?? "",
    })
    setOpen(true)
  }

  const save = () => {
    const countryId = Number(form.countryId)
    const cityId = Number(form.cityId)
    if (!Number.isSafeInteger(countryId) || !Number.isSafeInteger(cityId)) return

    const payload = {
      address: form.address,
      streetName: form.streetName || undefined,
      buildingNumber: form.buildingNumber || undefined,
      countryId,
      cityId,
    }
    const onSuccess = () => setOpen(false)

    if (editing) {
      updateAddress.mutate({ ...payload, _endpoint: `/api/client/profile/addresses/${editing.id}` }, { onSuccess })
    } else {
      createAddress.mutate({ ...payload, isDefault: (addresses.data?.length ?? 0) === 0 }, { onSuccess })
    }
  }

  const pending = createAddress.isPending || updateAddress.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Addresses</h1>
        <Button size="sm" onClick={openAdd}><HugeiconsIcon icon={PlusSignIcon} className="size-4" /> Add Address</Button>
      </div>

      {addresses.isPending ? (
        <p className="text-sm text-muted-foreground">Loading addresses...</p>
      ) : (addresses.data?.length ?? 0) === 0 ? (
        <Empty className="py-24">
          <EmptyHeader>
            <EmptyMedia variant="icon"><HugeiconsIcon icon={Location01Icon} className="size-8" /></EmptyMedia>
            <EmptyTitle>No addresses saved</EmptyTitle>
            <EmptyDescription>Add a delivery address to make checkout faster.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button onClick={openAdd}>Add New Address</Button></EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.data?.map((address) => (
            <article key={address.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{address.street_name || "Delivery Address"}</h2>
                {address.is_default && <Badge variant="outline">Default</Badge>}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {[address.building_number, address.address, locationName(address.city), locationName(address.country)].filter(Boolean).join(", ")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                <button onClick={() => openEdit(address)}>Edit</button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this address?")) {
                      deleteAddress.mutate({ _endpoint: `/api/client/profile/addresses/${address.id}` })
                    }
                  }}
                >
                  Remove
                </button>
                {!address.is_default && (
                  <button className="ms-auto" onClick={() => setDefaultAddress.mutate({ _endpoint: `/api/client/profile/addresses/${address.id}/default` })}>
                    Set as default
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>Enter your delivery address details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Street name" value={form.streetName} onChange={(event) => setForm({ ...form, streetName: event.target.value })} />
              <Input placeholder="Building number" value={form.buildingNumber} onChange={(event) => setForm({ ...form, buildingNumber: event.target.value })} />
            </div>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.countryId} onChange={(event) => setForm({ ...form, countryId: event.target.value, cityId: "" })}>
              <option value="">Select country</option>
              {countries.data?.map((country) => <option key={country.id} value={country.id}>{locationName(country)}</option>)}
            </select>
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.cityId} disabled={!form.countryId} onChange={(event) => setForm({ ...form, cityId: event.target.value })}>
              <option value="">Select city</option>
              {cities.data?.map((city) => <option key={city.id} value={city.id}>{locationName(city)}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.address || !form.countryId || !form.cityId}>{pending ? "Saving..." : "Save Address"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
