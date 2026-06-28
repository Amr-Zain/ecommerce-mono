"use client"

import { ArrowLeft01Icon, CheckmarkCircle01Icon, Location01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { useForm } from "react-hook-form"

import { Badge } from "@ecommerce/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { PricingSummary, type Pricing } from "@/components/cart/step-cart"
import {
  locationName,
  useAddresses,
  useCities,
  useCountries,
  useCreateAddress,
} from "@/hooks/api/use-checkout"
import { cn } from "@/lib/utils"
import { AppFormComplete, type FormField } from "@ecommerce/forms"

interface AddressStepProps {
  pricing: Pricing
  selectedId: string
  previewPending: boolean
  onBack: () => void
  onNext: () => void
  onSelect: (id: string) => void
}

const EMPTY_ADDRESS_FORM = {
  address: "",
  streetName: "",
  buildingNumber: "",
  countryId: "",
  cityId: "",
}

type AddressFormValues = typeof EMPTY_ADDRESS_FORM

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
  const addressForm = useForm<AddressFormValues>({
    defaultValues: EMPTY_ADDRESS_FORM,
    mode: "onChange",
  })
  const countryIdValue = addressForm.watch("countryId")
  const cityIdValue = addressForm.watch("cityId")
  const addressValue = addressForm.watch("address")
  const cities = useCities(countryIdValue)

  const saveAddress = (values: AddressFormValues) => {
    const countryId = Number(values.countryId)
    const cityId = Number(values.cityId)
    if (!Number.isSafeInteger(countryId) || countryId <= 0 || !Number.isSafeInteger(cityId) || cityId <= 0) {
      return
    }

    createAddress.mutate(
      {
        address: values.address,
        streetName: values.streetName || undefined,
        buildingNumber: values.buildingNumber || undefined,
        countryId,
        cityId,
        isDefault: (addresses.data?.length ?? 0) === 0,
      },
      {
        onSuccess: (response) => {
          const created = response as { data?: { id?: string } }
          if (created.data?.id) onSelect(String(created.data.id))
          setIsAddOpen(false)
          addressForm.reset(EMPTY_ADDRESS_FORM)
        },
      }
    )
  }

  const addressFields: FormField<AddressFormValues>[] = [
    {
      type: "textarea",
      name: "address",
      label: "Address",
      required: true,
      inputProps: {
        required: true,
        disabled: createAddress.isPending,
      },
    },
    {
      type: "text",
      name: "streetName",
      label: "Street name",
      inputProps: {
        disabled: createAddress.isPending,
      },
    },
    {
      type: "text",
      name: "buildingNumber",
      label: "Building number",
      inputProps: {
        disabled: createAddress.isPending,
      },
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
        disabled: createAddress.isPending,
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
        disabled: createAddress.isPending || !countryIdValue,
      },
    },
  ]

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
          <AppFormComplete
            form={addressForm}
            fields={addressFields}
            onSubmit={saveAddress}
            isLoading={createAddress.isPending}
            submitDisabled={!addressValue || !countryIdValue || !cityIdValue}
            submitButtonText="Save Address"
            loadingButtonText="Saving..."
            showResetButton
            resetButtonText="Cancel"
            onReset={() => setIsAddOpen(false)}
            resetButtonClassName="w-full sm:w-auto"
            submitButtonClassName="w-full sm:w-auto"
            buttonContainerClassName="sm:justify-end"
            onError={() => undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

