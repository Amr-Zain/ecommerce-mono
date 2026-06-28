"use client"

import { Location01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { useForm } from "react-hook-form"

import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@ecommerce/ui/components/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { locationName, useAddresses, useCities, useCountries, useCreateAddress, type Address } from "@/hooks/api/use-checkout"
import { useDeleteAddress, useSetDefaultAddress, useUpdateAddress } from "@/hooks/api/use-profile-commerce"
import { AppFormComplete, type FormField } from "@ecommerce/forms"

const EMPTY_FORM = { address: "", streetName: "", buildingNumber: "", countryId: "", cityId: "" }
type AddressFormValues = typeof EMPTY_FORM

export default function AddressesPage() {
  const addresses = useAddresses()
  const countries = useCountries()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Address | null>(null)
  const addressForm = useForm<AddressFormValues>({
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  })
  const countryIdValue = addressForm.watch("countryId")
  const cities = useCities(countryIdValue)

  const openAdd = () => {
    setEditing(null)
    addressForm.reset(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditing(address)
    addressForm.reset({
      address: address.address,
      streetName: address.street_name ?? "",
      buildingNumber: address.building_number ?? "",
      countryId: address.country_id ?? address.country?.id ?? "",
      cityId: address.city_id ?? address.city?.id ?? "",
    })
    setOpen(true)
  }

  const save = (values: AddressFormValues) => {
    const countryId = Number(values.countryId)
    const cityId = Number(values.cityId)
    if (!Number.isSafeInteger(countryId) || !Number.isSafeInteger(cityId)) return

    const payload = {
      address: values.address,
      streetName: values.streetName || undefined,
      buildingNumber: values.buildingNumber || undefined,
      countryId,
      cityId,
    }
    const onSuccess = () => setOpen(false)

    if (editing) {
      updateAddress.mutate({ ...payload, id: editing.id }, { onSuccess })
    } else {
      createAddress.mutate({ ...payload, isDefault: (addresses.data?.length ?? 0) === 0 }, { onSuccess })
    }
  }

  const pending = createAddress.isPending || updateAddress.isPending
  const addressValue = addressForm.watch("address")
  const cityIdValue = addressForm.watch("cityId")
  const addressFields: FormField<AddressFormValues>[] = [
    {
      type: "textarea",
      name: "address",
      label: "Address",
      required: true,
      inputProps: { required: true, disabled: pending },
    },
    {
      type: "text",
      name: "streetName",
      label: "Street name",
      inputProps: { disabled: pending },
    },
    {
      type: "text",
      name: "buildingNumber",
      label: "Building number",
      inputProps: { disabled: pending },
    },
    {
      type: "select",
      name: "countryId",
      label: "Country",
      required: true,
      placeholder: "Select country",
      options: (countries.data ?? []).map((country) => ({
        value: country.id,
        label: locationName(country),
      })),
      inputProps: {
        required: true,
        disabled: pending,
        onChange: (event) => {
          addressForm.setValue("countryId", event.currentTarget.value, {
            shouldDirty: true,
            shouldValidate: true,
          })
          addressForm.setValue("cityId", "", {
            shouldDirty: true,
            shouldValidate: true,
          })
        },
      },
    },
    {
      type: "select",
      name: "cityId",
      label: "City",
      required: true,
      placeholder: "Select city",
      options: (cities.data ?? []).map((city) => ({
        value: city.id,
        label: locationName(city),
      })),
      inputProps: {
        required: true,
        disabled: pending || !countryIdValue,
      },
    },
  ]

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
                      deleteAddress.mutate({ id: address.id })
                    }
                  }}
                >
                  Remove
                </button>
                {!address.is_default && (
                  <button className="ms-auto" onClick={() => setDefaultAddress.mutate({ id: address.id })}>
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
          <AppFormComplete
            form={addressForm}
            fields={addressFields}
            onSubmit={save}
            isLoading={pending}
            submitDisabled={!addressValue || !countryIdValue || !cityIdValue}
            submitButtonText="Save Address"
            loadingButtonText="Saving..."
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
