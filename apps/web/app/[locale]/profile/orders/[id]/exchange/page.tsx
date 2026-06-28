"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import * as React from "react"
import { useForm } from "react-hook-form"

import { Button } from "@ecommerce/ui/components/button"
import { useProduct } from "@/hooks/api/use-products"
import { isReturnExchangeEligible, useCreateExchange, useCreateReturn, useOrder } from "@/hooks/api/use-profile-commerce"
import { cn } from "@/lib/utils"
import { AppFormComplete, type FormField } from "@ecommerce/forms"

type ProductVariant = { id: string; stock_quantity?: number; attributes?: Array<{ attribute?: { name?: string }; value?: { name?: string } }> }
type ReturnExchangeFormValues = {
  itemId: string
  quantity: number
  reason: string
  note: string
  newVariantId: string
}

const DEFAULT_FORM_VALUES: ReturnExchangeFormValues = {
  itemId: "",
  quantity: 1,
  reason: "",
  note: "",
  newVariantId: "",
}

export default function ExchangeReturnPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const order = useOrder(id)
  const createReturn = useCreateReturn()
  const createExchange = useCreateExchange()
  const [mode, setMode] = React.useState<"return" | "exchange">("return")
  const form = useForm<ReturnExchangeFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  })
  const itemId = form.watch("itemId")
  const reason = form.watch("reason")
  const newVariantId = form.watch("newVariantId")
  const activeItemId = itemId || order.data?.items[0]?.id || ""
  const selectedItem = order.data?.items.find((item) => item.id === activeItemId)
  const product = useProduct(selectedItem?.product_id)
  const variants = (((product.data?.data as unknown as { variants?: ProductVariant[] })?.variants) ?? []).filter(
    (variant) => variant.id !== selectedItem?.variant_id && (variant.stock_quantity ?? 1) > 0
  )

  React.useEffect(() => {
    const firstItemId = order.data?.items[0]?.id
    if (firstItemId && !form.getValues("itemId")) {
      form.setValue("itemId", firstItemId)
    }
  }, [form, order.data?.items])

  const submit = (values: ReturnExchangeFormValues) => {
    if (!selectedItem || !values.reason.trim()) return
    const common = {
      orderItemId: selectedItem.id,
      quantity: values.quantity,
      reason: values.reason,
      note: values.note || undefined,
    }
    const onSuccess = () => router.push(ROUTES.profile.orders.detail(id))
    if (mode === "return") {
      createReturn.mutate(
        { items: [common], note: values.note || undefined },
        { onSuccess },
      )
    } else if (values.newVariantId) {
      createExchange.mutate(
        {
          items: [{ ...common, newVariantId: values.newVariantId }],
          note: values.note || undefined,
        },
        { onSuccess },
      )
    }
  }

  if (order.isPending) return <p className="text-sm text-muted-foreground">Loading order...</p>
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>
  if (!isReturnExchangeEligible(order.data)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Return or Exchange unavailable</h1>
        <p className="text-sm text-muted-foreground">Available only for delivered orders within 14 days of delivery.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.profile.orders.detail(id))}>Back to Order</Button>
      </div>
    )
  }

  const pending = createReturn.isPending || createExchange.isPending
  const fields: FormField<ReturnExchangeFormValues>[] = [
    {
      type: "select",
      name: "itemId",
      label: "Order item",
      options: order.data.items.map((item) => ({
        value: item.id,
        label: item.product_name_snapshot,
      })),
      inputProps: {
        disabled: pending,
        onChange: (event) => {
          form.setValue("itemId", event.currentTarget.value, {
            shouldDirty: true,
            shouldValidate: true,
          })
          form.setValue("newVariantId", "", {
            shouldDirty: true,
            shouldValidate: true,
          })
          form.setValue("quantity", 1, {
            shouldDirty: true,
            shouldValidate: true,
          })
        },
      },
    },
    {
      type: "number",
      name: "quantity",
      label: "Quantity",
      required: true,
      inputProps: {
        required: true,
        min: 1,
        max: selectedItem?.quantity ?? 1,
        disabled: pending,
        onChange: (event) => {
          const nextQuantity = Math.max(
            1,
            Math.min(
              selectedItem?.quantity ?? 1,
              Number(event.currentTarget.value),
            ),
          )
          form.setValue("quantity", nextQuantity, {
            shouldDirty: true,
            shouldValidate: true,
          })
        },
      },
    },
    {
      type: "text",
      name: "reason",
      label: "Reason",
      required: true,
      placeholder: "wrong_size, damaged, wrong_item...",
      inputProps: {
        required: true,
        disabled: pending,
      },
    },
    {
      type: "textarea",
      name: "note",
      label: "Note",
      placeholder: "Describe the issue",
      inputProps: {
        disabled: pending,
      },
    },
    ...(mode === "exchange"
      ? [
          {
            type: "select" as const,
            name: "newVariantId" as const,
            label: "Replacement variant",
            required: true,
            placeholder: "Select replacement",
            options: variants.map((variant) => ({
              value: variant.id,
              label:
                variant.attributes
                  ?.map((attribute) => attribute.value?.name)
                  .filter(Boolean)
                  .join(" / ") || `Variant ${variant.id}`,
            })),
            inputProps: {
              required: true,
              disabled: pending,
            },
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Return or Exchange</h1>
      <div className="flex border-b">
        {(["return", "exchange"] as const).map((value) => (
          <button key={value} onClick={() => setMode(value)} className={cn("flex-1 border-b-2 pb-3 text-sm font-semibold capitalize", mode === value ? "border-foreground" : "border-transparent text-muted-foreground")}>{value}</button>
        ))}
      </div>
      <AppFormComplete
        form={form}
        fields={fields}
        onSubmit={submit}
        isLoading={pending}
        submitDisabled={
          !reason.trim() || (mode === "exchange" && !newVariantId)
        }
        submitButtonText={`Confirm ${mode}`}
        loadingButtonText="Submitting..."
      />
    </div>
  )
}
