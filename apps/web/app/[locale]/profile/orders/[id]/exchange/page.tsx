"use client"

import { useParams, useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { useProduct } from "@/hooks/api/use-products"
import { isReturnExchangeEligible, useCreateExchange, useCreateReturn, useOrder } from "@/hooks/api/use-profile-commerce"
import { cn } from "@/lib/utils"

type ProductVariant = { id: string; stock_quantity?: number; attributes?: Array<{ attribute?: { name?: string }; value?: { name?: string } }> }

export default function ExchangeReturnPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const order = useOrder(id)
  const createReturn = useCreateReturn()
  const createExchange = useCreateExchange()
  const [mode, setMode] = React.useState<"return" | "exchange">("return")
  const [itemId, setItemId] = React.useState("")
  const [quantity, setQuantity] = React.useState(1)
  const [reason, setReason] = React.useState("")
  const [note, setNote] = React.useState("")
  const [newVariantId, setNewVariantId] = React.useState("")
  const activeItemId = itemId || order.data?.items[0]?.id || ""
  const selectedItem = order.data?.items.find((item) => item.id === activeItemId)
  const product = useProduct(selectedItem?.product_id)
  const variants = (((product.data?.data as unknown as { variants?: ProductVariant[] })?.variants) ?? []).filter(
    (variant) => variant.id !== selectedItem?.variant_id && (variant.stock_quantity ?? 1) > 0
  )

  const submit = () => {
    if (!selectedItem || !reason.trim()) return
    const common = { orderItemId: selectedItem.id, quantity, reason, note: note || undefined }
    const onSuccess = () => router.push(`/profile/orders/${id}`)
    if (mode === "return") createReturn.mutate({ items: [common], note: note || undefined }, { onSuccess })
    else if (newVariantId) createExchange.mutate({ items: [{ ...common, newVariantId }], note: note || undefined }, { onSuccess })
  }

  if (order.isPending) return <p className="text-sm text-muted-foreground">Loading order...</p>
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>
  if (!isReturnExchangeEligible(order.data)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Return or Exchange unavailable</h1>
        <p className="text-sm text-muted-foreground">Available only for delivered orders within 14 days of delivery.</p>
        <Button variant="outline" onClick={() => router.push(`/profile/orders/${id}`)}>Back to Order</Button>
      </div>
    )
  }

  const pending = createReturn.isPending || createExchange.isPending
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Return or Exchange</h1>
      <div className="flex border-b">
        {(["return", "exchange"] as const).map((value) => (
          <button key={value} onClick={() => setMode(value)} className={cn("flex-1 border-b-2 pb-3 text-sm font-semibold capitalize", mode === value ? "border-foreground" : "border-transparent text-muted-foreground")}>{value}</button>
        ))}
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">Order item
          <select className="h-10 rounded-md border bg-background px-3 font-normal" value={activeItemId} onChange={(event) => { setItemId(event.target.value); setNewVariantId("") }}>
            {order.data.items.map((item) => <option key={item.id} value={item.id}>{item.product_name_snapshot}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">Quantity
          <Input type="number" min={1} max={selectedItem?.quantity ?? 1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(selectedItem?.quantity ?? 1, Number(event.target.value))))} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">Reason
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="wrong_size, damaged, wrong_item..." />
        </label>
        <label className="grid gap-2 text-sm font-semibold">Note
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Describe the issue" />
        </label>
        {mode === "exchange" && (
          <label className="grid gap-2 text-sm font-semibold">Replacement variant
            <select className="h-10 rounded-md border bg-background px-3 font-normal" value={newVariantId} onChange={(event) => setNewVariantId(event.target.value)}>
              <option value="">Select replacement</option>
              {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.attributes?.map((attribute) => attribute.value?.name).filter(Boolean).join(" / ") || `Variant ${variant.id}`}</option>)}
            </select>
          </label>
        )}
      </div>
      <Button className="w-full" onClick={submit} disabled={pending || !reason.trim() || (mode === "exchange" && !newVariantId)}>
        {pending ? "Submitting..." : `Confirm ${mode}`}
      </Button>
    </div>
  )
}
