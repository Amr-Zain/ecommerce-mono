import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { formatDate, getModalTitle } from '@/util/helpers'
import { ProductVariation, PriceHistoryEntry, InventoryLogEntry } from '@/types/api/product'
import ImageWithPreview from '@/components/common/uiComponents/image/ImagePreview'
import { Plus, History, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { HasPermission } from '@/components/common/HasPermission'
import { useEffect, useState } from 'react'
import { useAlertModal } from '@/stores/useAlertModal'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { queryKeys } from '@/util/queryKeysFactory'
import { useParams } from '@tanstack/react-router'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import { SARIcon } from '@/components/common/Icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { ScrollArea } from '@ecommerce/ui/components/scroll-area'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { RowActions } from '@/components/common/table/RowActions'
import { RowAction } from '@/types/components/table'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { Input } from '@ecommerce/ui/components/input'
import { Switch } from '@ecommerce/ui/components/switch'

/* ------------------------------------------------------------------ */
/*  Simple inline pagination for history tables                       */
/* ------------------------------------------------------------------ */
function InlinePagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-end gap-2 mt-2">
      <span className="text-[11px] text-muted-foreground">
        {t('Text.page')} {page} {t('Text.of')} {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-3 w-3 rtl:rotate-180" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  History Dialog – fetches on open with skeleton + pagination       */
/* ------------------------------------------------------------------ */
function VariantHistoryDialog({
  variantId,
  open,
  onClose,
}: {
  variantId: number | null
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [pricePage, setPricePage] = useState(1)
  const [inventoryPage, setInventoryPage] = useState(1)
  const limit = 10

  const priceQuery = useFetch<
    any,
    { items: PriceHistoryEntry[]; meta?: any }
  >({
    endpoint: open && variantId ? `variants/${variantId}/price-history?page=${pricePage}&limit=${limit}` : undefined,
    queryKey: ['variant-price-history', String(variantId), pricePage],
    enabled: open && !!variantId,
    select: (res: any) => res.data,
  })

  const inventoryQuery = useFetch<
    any,
    { items: InventoryLogEntry[]; meta?: any }
  >({
    endpoint: open && variantId ? `variants/${variantId}/inventory-logs?page=${inventoryPage}&limit=${limit}` : undefined,
    queryKey: ['variant-inventory-logs', String(variantId), inventoryPage],
    enabled: open && !!variantId,
    select: (res: any) => res.data,
  })

  const priceHistory = priceQuery.data?.items ?? []
  const priceMeta = priceQuery.data?.meta
  const inventoryLogs = inventoryQuery.data?.items ?? []
  const inventoryMeta = inventoryQuery.data?.meta

  const isLoading = priceQuery.isPending || inventoryQuery.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border border-border rounded-lg shadow-sm p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            {t('productShow.variations.history', 'History')}
            <span className="text-muted-foreground font-normal text-sm">
              — #{variantId}
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-6 pb-6">
          <div className="space-y-6">
            {/* Price History */}
            <div>
              <h4 className="text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                {t('productShow.variations.priceHistory', 'Price History')}
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : priceHistory.length > 0 ? (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2 font-semibold">{t('productShow.history.oldPrice')}</th>
                          <th className="text-left p-2 font-semibold">{t('productShow.history.newPrice')}</th>
                          <th className="text-left p-2 font-semibold">{t('table.createdAt')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {priceHistory.map((h) => (
                          <tr key={h.id}>
                            <td className="p-2">{h.old_price}</td>
                            <td className="p-2 font-medium">{h.new_price}</td>
                            <td className="p-2 text-muted-foreground">{formatDate(h.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <InlinePagination
                    page={pricePage}
                    totalPages={priceMeta?.total_pages ?? 1}
                    onChange={setPricePage}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center bg-muted/20 rounded-lg border border-dashed">
                  {t('Text.noResults')}
                </p>
              )}
            </div>

            {/* Inventory Logs */}
            <div>
              <h4 className="text-sm font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                {t('productShow.variations.inventoryLogs', 'Inventory Logs')}
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : inventoryLogs.length > 0 ? (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2 font-semibold">{t('productShow.history.change')}</th>
                          <th className="text-left p-2 font-semibold">{t('productShow.history.previous')}</th>
                          <th className="text-left p-2 font-semibold">{t('productShow.history.new')}</th>
                          <th className="text-left p-2 font-semibold">{t('Form.labels.reason')}</th>
                          <th className="text-left p-2 font-semibold">{t('table.createdAt')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {inventoryLogs.map((log) => (
                          <tr key={log.id}>
                            <td className={`p-2 font-medium ${log.change_amount > 0 ? 'text-emerald-600' : log.change_amount < 0 ? 'text-destructive' : ''}`}>
                              {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                            </td>
                            <td className="p-2">{log.previous_stock}</td>
                            <td className="p-2 font-medium">{log.new_stock}</td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-[9px] h-4 px-1">
                                {log.reason}
                              </Badge>
                            </td>
                            <td className="p-2 text-muted-foreground">{formatDate(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <InlinePagination
                    page={inventoryPage}
                    totalPages={inventoryMeta?.total_pages ?? 1}
                    onChange={setInventoryPage}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center bg-muted/20 rounded-lg border border-dashed">
                  {t('Text.noResults')}
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Card                                                          */
/* ------------------------------------------------------------------ */
type Props = {
  variations: ProductVariation[]
  onCreate?: () => void
  onEdit?: (v: ProductVariation) => void
  onView?: (v: ProductVariation) => void
}

export function ProductVariationsCard({
  variations,
  onCreate,
  onEdit,
  onView,
}: Props) {
  const { t } = useTranslation()
  const alert = useAlertModal()

  const productId = useParams({ from: '/_main/products/show/$id' }).id

  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const [historyVariantId, setHistoryVariantId] = useState<number | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const [addStockVariant, setAddStockVariant] = useState<ProductVariation | null>(null)
  const [addStockOpen, setAddStockOpen] = useState(false)
  const [addStockAmount, setAddStockAmount] = useState('')
  const [addStockReason, setAddStockReason] = useState<'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN'>('RESTOCK')

  const currentId = selected?.id || ''
  const invalidateKey = queryKeys.products.getProduct(productId)

  const { mutateAsync: changeActive, isPending: activePending } =
    useStatusMutation(
      currentId,
      'active',
      'variants',
      invalidateKey,
      [queryKeys.products.getProduct(productId)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'variants',
      invalidateKey,
      [queryKeys.products.getProduct(productId)],
    )

  const { mutate: adjustStockMutate, isPending: adjustStockPending } = useMutate({
    endpoint: 'variants/adjust-stock',
    method: 'post',
    mutationKey: queryKeys.products.getProduct(productId),
    invalidates: [queryKeys.products.all(), queryKeys.products.getProduct(productId)],
    onSuccess: () => {
      setAddStockOpen(false)
      setAddStockVariant(null)
      setAddStockAmount('')
    },
  })

  useEffect(() => {
    alert.setPending(activePending || deletePending || adjustStockPending)
  }, [activePending, deletePending, adjustStockPending])

  const openAlert = (type: PickedAction, row: ProductVariation) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })

    const handler = async () => {
      if (type === 'active') {
        await changeActive({ is_active: !row.is_active })
      } else {
        await changeDelete({})
      }
      alert.setIsOpen(false)
    }

    const { title, desc } = getModalTitle(type, 'variation', t)
    alert.setModel({
      isOpen: true,
      variant: type === 'delete' ? 'destructive' : 'default',
      title,
      desc,
      handleConfirm: handler,
    })
    alert.setHandler(handler)
  }

  const openHistory = (row: ProductVariation) => {
    setHistoryVariantId(Number(row.id))
    setHistoryOpen(true)
  }

  const handleAction = (
    type: 'edit' | 'view' | 'delete' | 'active',
    row: ProductVariation,
  ) => {
    if (type === 'edit') return onEdit?.(row)
    if (type === 'view') return onView?.(row)
    if (type === 'delete' || type === 'active') return openAlert(type, row)
  }

  const variationActions: RowAction<ProductVariation>[] = [
    {
      label: t('productShow.variations.history', 'History'),
      onClick: (row) => openHistory(row),
    },
    {
      label: t('actions.edit'),
      onClick: (row) => onEdit?.(row),
      permission: 'products',
      action: 'update',
    },
    {
      label: t('actions.adjustStock', 'Adjust Stock'),
      onClick: (row) => {
        setAddStockVariant(row)
        setAddStockOpen(true)
      },
      permission: 'products',
      action: 'update',
    },
    {
      label: t('actions.delete'),
      onClick: (row) => openAlert('delete', row),
      permission: 'products',
      action: 'destroy',
      danger: true,
      dividerAbove: true,
    },
  ]

  const VariationActions = RowActions<ProductVariation>({
    actions: variationActions,
    menuLabel: t('actions.title'),
  })

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-3">
          {t('productShow.variations.title', 'Variations')}
          <HasPermission entity="products" action="store">
            <Button size="sm" onClick={onCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t('actions.add', { entity: t('common.variation') })}
            </Button>
          </HasPermission>
        </CardTitle>
        <CardDescription>
          {t('productShow.variations.subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="divide-y min-w-5xl">
          {variations.map((v) => (
            <div
              key={v.id}
              className={`grid items-start gap-3 py-3 grid-cols-16`}
            >
              {/* images */}
              <div className="col-span-3">
                <div className="flex flex-wrap gap-1">
                  {(
                    v.gallery || []
                  )?.map((image, idx) => (
                    <ImageWithPreview
                      key={`${v.id}-img-${idx}`}
                      src={image.path}
                      className="size-8 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* attributes */}
              <div className="col-span-3">
                <div className="flex flex-wrap gap-1.5">
                  {v.attributes?.map((a) => (
                    <Badge
                      key={`${v.id}-${a.value_id}`}
                      variant="secondary"
                      className="whitespace-nowrap text-[10px] px-1.5 py-0"
                    >
                      {a.attribute?.name ?? a.attribute?.en?.name}: {a.value?.name ?? a.value?.en?.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* price */}
              <div className="col-span-1 text-[13px] font-medium h-10 flex items-center whitespace-nowrap gap-0.5">
                {v.price} <SARIcon className="h-3 w-3 opacity-60" />
              </div>

              {/* sku */}
              <div className="col-span-3 h-10 flex items-center gap-1.5 overflow-hidden">
                <span className="text-[9px] uppercase text-muted-foreground font-bold shrink-0">{t('table.columns.sku')}:</span>
                <div className='flex-1 flex gap-1 items-center bg-muted/30 px-2 py-0.5 rounded border border-border/50 min-w-0'>
                  <div className='flex-1 truncate text-[11px] font-medium'>{v.sku}</div>
                  <ButtonCopy content={v.sku} className='size-6 shrink-0 p-0' />
                </div>
              </div>

              {/* barcode */}
              <div className="col-span-3 h-10 flex items-center gap-1.5 overflow-hidden">
                <span className="text-[9px] uppercase text-muted-foreground font-bold shrink-0">{t('table.columns.barcode')}:</span>
                <div className='flex-1 flex gap-1 items-center bg-muted/30 px-2 py-0.5 rounded border border-border/50 min-w-0'>
                  <div className='flex-1 truncate text-[11px] font-medium'>{v.barcode}</div>
                  <ButtonCopy content={v.barcode} className='size-6 shrink-0 p-0' />
                </div>
              </div>

              {/* stock */}
              <div className="col-span-1 h-10 flex flex-col justify-center">
                <span className="text-[9px] uppercase text-muted-foreground font-bold leading-none">{t('table.columns.stock')}:</span>
                <span className="text-[13px] font-medium leading-tight">{v.stock_quantity}</span>
              </div>

              {/* status switch */}
              <div className="col-span-1 h-10 flex items-center">
                <Switch
                  checked={v.is_active}
                  onCheckedChange={() => openAlert('active', v)}
                  className="cursor-pointer"
                />
              </div>

              {/* actions dropdown */}
              <div className="col-span-1 flex items-center justify-end h-10">
                {VariationActions({ original: v })}
              </div>
            </div>
          ))}

          {variations.length === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              {t('Text.noResults')}
            </div>
          )}
        </div>
      </CardContent>

      <VariantHistoryDialog
        variantId={historyVariantId}
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false)
          setHistoryVariantId(null)
        }}
      />

      {/* Adjust Stock Dialog */}
      <Dialog open={addStockOpen} onOpenChange={(o) => {
        if (!o) {
          setAddStockOpen(false)
          setAddStockVariant(null)
          setAddStockAmount('')
          setAddStockReason('RESTOCK')
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-lg shadow-sm p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-base">
              {t('actions.adjustStock', 'Adjust Stock')}
              {addStockVariant && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  — {addStockVariant.sku || `#${addStockVariant.id}`}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t('productShow.variations.currentStock', 'Current Stock')}: {addStockVariant?.stock_quantity ?? 0}
              </label>
              <Input
                type="number"
                placeholder={t('productShow.variations.amountPlaceholder', 'e.g. 10 or -5')}
                value={addStockAmount}
                onChange={(e) => {
                  const val = e.target.value
                  setAddStockAmount(val)
                  const num = Number(val)
                  if (!isNaN(num)) {
                    if (num > 0) setAddStockReason('RESTOCK')
                    else if (num < 0) setAddStockReason('SALE')
                  }
                }}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {t('productShow.variations.adjustHint', 'Use positive to add, negative to subtract')}
              </p>
              {(() => {
                const num = Number(addStockAmount)
                const current = addStockVariant?.stock_quantity ?? 0
                const projected = current + num
                if (!isNaN(num) && projected < 0) {
                  return (
                    <p className="text-xs text-destructive mt-1.5 font-medium">
                      {t('productShow.variations.stockBelowZero', 'Resulting stock would be {{projected}}. Stock cannot go below zero.', { projected })}
                    </p>
                  )
                }
                return null
              })()}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t('productShow.variations.reason', 'Reason')}
              </label>
              <select
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={addStockReason}
                onChange={(e) => setAddStockReason(e.target.value as any)}
              >
                {(() => {
                  const num = Number(addStockAmount)
                  const positiveReasons = ['RESTOCK', 'RETURN', 'ADJUSTMENT'] as const
                  const negativeReasons = ['SALE', 'ADJUSTMENT'] as const
                  const reasons =
                    !addStockAmount || isNaN(num) || num === 0
                      ? (['RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN'] as const)
                      : num > 0
                        ? positiveReasons
                        : negativeReasons
                  return reasons.map((r) => (
                    <option key={r} value={r}>
                      {t(`productShow.variations.reasons.${r}`, r)}
                    </option>
                  ))
                })()}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddStockOpen(false)
                  setAddStockVariant(null)
                  setAddStockAmount('')
                  setAddStockReason('RESTOCK')
                }}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                disabled={!addStockAmount || Number(addStockAmount) === 0 || ((addStockVariant?.stock_quantity ?? 0) + Number(addStockAmount)) < 0 || adjustStockPending}
                onClick={() => {
                  if (!addStockVariant) return
                  adjustStockMutate({
                    variantId: Number(addStockVariant.id),
                    amount: Number(addStockAmount),
                    reason: addStockReason,
                  })
                }}
              >
                {adjustStockPending ? t('Text.loading') : t('actions.confirm')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ProductVariationsCard
