import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { z } from 'zod/v4'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Separator } from '@ecommerce/ui/components/separator'
import type { ApiResponseBase } from '@/types/api/http'
import type { ExchangeRequest, ReturnRequest } from '@/types/api/order'
import type { FieldProp } from '@/types/components/form'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { cn } from '@/lib/utils'
import {
  EXCHANGE_REQUEST_STATUSES,
  PRICE_ADJUSTMENT_STATUSES,
  REFUND_STATUSES,
  RETURN_REQUEST_STATUSES,
} from '@/types/api/order'
import { queryKeys } from '@/util/queryKeysFactory'

const dispositions = ['restock', 'quarantine', 'damaged', 'discarded']
const outlineButtonClass = cn(
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors',
  'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
)
const linkClass = 'font-bold text-primary underline-offset-4 hover:underline'

type WorkflowKind = 'return' | 'exchange'
type WorkflowRequest = ReturnRequest | ExchangeRequest
type WorkflowAction =
  | 'approve'
  | 'reject'
  | 'receive'
  | 'refund'
  | 'refund-difference'
  | 'waive-adjustment'
  | 'retry-reservation'
  | 'release-expired'
  | 'ship'
  | 'complete'

type ReceiveItemState = {
  id: string
  accepted_quantity: number
  disposition: string
  adjusted_refund_amount?: number
  adjusted_vat_refund_amount?: number
  refund_adjustment_reason?: string
  note?: string
}

type DialogState = {
  action: WorkflowAction
  note: string
  shipping_amount?: number
  shipping_reason: string
  wallet_refund_amount?: number
  original_refund_amount?: number
  manual_refund_amount?: number
  items: Array<ReceiveItemState>
}

const actionDialogSchema = z.object({
  action: z.string(),
  note: z.string().optional(),
  shipping_amount: z.coerce.number().min(0).optional(),
  shipping_reason: z.string().optional(),
  wallet_refund_amount: z.coerce.number().min(0).optional(),
  original_refund_amount: z.coerce.number().min(0).optional(),
  manual_refund_amount: z.coerce.number().min(0).optional(),
  items: z.array(
    z.object({
      id: z.string(),
      accepted_quantity: z.coerce.number().min(0),
      disposition: z.string().min(1),
      adjusted_refund_amount: z.coerce.number().min(0).optional(),
      adjusted_vat_refund_amount: z.coerce.number().min(0).optional(),
      refund_adjustment_reason: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
})

export function ReturnExchangeShow({
  kind,
  request,
}: {
  kind: WorkflowKind
  request: WorkflowRequest
}) {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const isReturn = kind === 'return'
  const endpointRoot = isReturn ? 'returns' : 'exchanges'
  const listKey = isReturn ? queryKeys.returns.all() : queryKeys.exchanges.all()
  const detailKey = isReturn
    ? queryKeys.returns.getReturn(request.id)
    : queryKeys.exchanges.getExchange(request.id)

  const mutation = useMutate<
    ApiResponseBase<WorkflowRequest>,
    Record<string, unknown>
  >({
    endpoint:
      dialog?.action === 'release-expired'
        ? 'exchanges/release-expired'
        : `${endpointRoot}/${request.id}/${dialog?.action ?? 'approve'}`,
    mutationKey: detailKey,
    invalidates: [detailKey, listKey, queryKeys.orders.all()],
    onSuccess: () => {
      setDialog(null)
      queryClient.invalidateQueries({ queryKey: detailKey })
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
    },
  })

  const actions = useMemo(
    () => getAvailableActions(kind, request),
    [kind, request],
  )

  const openAction = (action: WorkflowAction) => {
    const refundAmount = getRefundAmount(action, request)
    const allocation = getDefaultRefundAllocation(request, refundAmount)
    setDialog({
      action,
      note: '',
      shipping_amount: isReturn
        ? (request as ReturnRequest).suggested_shipping_refund_amount
        : (request as ExchangeRequest).suggested_replacement_shipping_fee,
      shipping_reason: '',
      wallet_refund_amount: allocation.wallet,
      original_refund_amount: allocation.original,
      manual_refund_amount: allocation.manual,
      items: request.items.map((item: any) => ({
        id: item.id,
        accepted_quantity: item.accepted_quantity || item.quantity,
        disposition: item.item_disposition || 'restock',
        adjusted_refund_amount: item.calculated_refund_amount,
        adjusted_vat_refund_amount: item.calculated_vat_refund_amount,
        refund_adjustment_reason: item.refund_adjustment_reason || '',
        note: item.admin_note || '',
      })),
    })
  }

  const submitAction = (values: DialogState) => {
    const payload = buildPayload(kind, values)
    mutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {isReturn ? 'Return request' : 'Exchange request'} #{request.id}
          </p>
          <h1 className="text-2xl font-black">Order #{request.order_id}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link
              to="/orders/show/$id"
              params={{ id: request.order_id }}
              className={linkClass}
            >
              Admin order view
            </Link>
            <Link
              to="/users/show/$id"
              params={{ id: request.user_id }}
              className={linkClass}
            >
              Client view: {request.user_name || request.user_id}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {request.status.replace(/_/g, ' ')}
          </Badge>
          {'refund_status' in request && (
            <Badge variant="secondary" className="capitalize">
              {request.refund_status.replace(/_/g, ' ')}
            </Badge>
          )}
          {'price_adjustment_status' in request && (
            <Badge variant="secondary" className="capitalize">
              {request.price_adjustment_status.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {actions.length ? (
            actions.map((action) => (
              <Button
                key={action}
                variant={action === 'reject' ? 'destructive' : 'default'}
                onClick={() => openAction(action)}
              >
                {labelAction(action)}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No admin actions are currently available for this status.
            </p>
          )}
          <Link
            to={isReturn ? '/returns' : '/exchanges'}
            search={{ status: undefined }}
            className={outlineButtonClass}
          >
            Back to list
          </Link>
          <Link
            to="/orders/show/$id"
            params={{ id: request.order_id }}
            className={outlineButtonClass}
          >
            Open order
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <MoneyCard title="Values" request={request} />
        <NotesCard request={request} />
        <RelatedCard request={request} />
      </div>

      <ItemsCard kind={kind} request={request} />
      <HistoryCard request={request} />

      <ActionDialog
        kind={kind}
        request={request}
        dialog={dialog}
        pending={mutation.isPending}
        onChange={setDialog}
        onSubmit={submitAction}
      />
    </div>
  )
}

function MoneyCard({
  title,
  request,
}: {
  title: string
  request: WorkflowRequest
}) {
  const rows =
    'refund_status' in request
      ? [
          ['Calculated refund', money(request.calculated_refund_amount)],
          ['Calculated VAT', money(request.calculated_vat_refund_amount)],
          ['Adjusted refund', money(request.adjusted_refund_amount)],
          ['Adjusted VAT', money(request.adjusted_vat_refund_amount)],
          [
            'Suggested shipping',
            money(request.suggested_shipping_refund_amount),
          ],
          ['Shipping refund', money(request.shipping_refund_amount)],
          ['Final refund', money(request.final_refund_amount)],
        ]
      : [
          ['Old value', money(request.total_old_value)],
          ['New value', money(request.total_new_value)],
          ['Difference', money(request.total_price_difference)],
          [
            'Suggested shipping',
            money(request.suggested_replacement_shipping_fee),
          ],
          ['Replacement shipping', money(request.replacement_shipping_fee)],
          ['Settlement', money(request.settlement_amount)],
          ['Reservation expires', formatDate(request.replacement_expires_at)],
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-bold text-end">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function NotesCard({ request }: { request: WorkflowRequest }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Note label="Client" value={request.client_note} />
        <Note label="Admin" value={request.admin_note} />
        {'refund_adjustment_reason' in request && (
          <>
            <Note
              label="Refund adjustment"
              value={request.refund_adjustment_reason}
            />
            <Note
              label="Shipping refund"
              value={request.shipping_refund_reason}
            />
          </>
        )}
        {'shipping_fee_reason' in request && (
          <Note
            label="Shipping fee reason"
            value={request.shipping_fee_reason}
          />
        )}
      </CardContent>
    </Card>
  )
}

function RelatedCard({ request }: { request: WorkflowRequest }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <RelatedLink
          label="Order"
          to="/orders/show/$id"
          id={request.order_id}
        />
        <RelatedLink
          label="Client"
          to="/users/show/$id"
          id={request.user_id}
          value={request.user_name}
        />
        <Info label="Created" value={formatDate(request.created_at)} />
        <Info label="Updated" value={formatDate(request.updated_at)} />
      </CardContent>
    </Card>
  )
}

function RelatedLink({
  label,
  to,
  id,
  value,
}: {
  label: string
  to: '/orders/show/$id' | '/users/show/$id' | '/products/show/$id'
  id?: string | null
  value?: string | null
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {id ? (
        <Link to={to} params={{ id }} className={linkClass}>
          {value || `#${id}`}
        </Link>
      ) : (
        <span>-</span>
      )}
    </div>
  )
}

function Note({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p>{value || '-'}</p>
    </div>
  )
}

function HistoryCard({ request }: { request: WorkflowRequest }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow history</CardTitle>
      </CardHeader>
      <CardContent>
        {(request.history ?? []).length ? (
          <div className="relative space-y-0">
            {request.history?.map((entry, index) => (
              <div
                key={`${entry.created_at}-${index}`}
                className="relative grid gap-3 border-s ps-6 pb-6 last:pb-0"
              >
                <span className="absolute -start-2 top-1 size-4 rounded-full border-2 border-background bg-primary shadow" />
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-muted/20 p-4">
                  <div>
                    <p className="text-sm font-black capitalize">
                      {entry.previous_status
                        ? entry.previous_status.replace(/_/g, ' ')
                        : 'Created'}
                      <span className="mx-2 text-muted-foreground">{'->'}</span>
                      {entry.new_status.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                    {entry.reason && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {entry.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {entry.actor_type || 'system'}
                    </Badge>
                    {entry.actor_user_id && (
                      <Badge variant="secondary">
                        Actor #{entry.actor_user_id}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

function ItemsCard({
  kind,
  request,
}: {
  kind: WorkflowKind
  request: WorkflowRequest
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {request.items.map((item: any) => (
          <div key={item.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                {item.image_snapshot ? (
                  <img
                    src={item.image_snapshot}
                    alt={item.product_name_snapshot || `Item ${item.id}`}
                    className="size-16 rounded-lg border object-cover"
                  />
                ) : (
                  <div className="size-16 rounded-lg border bg-muted" />
                )}
                <div>
                  <p className="font-black">
                    {item.product_id ? (
                      <Link
                        to="/products/show/$id"
                        params={{ id: item.product_id }}
                        className={linkClass}
                      >
                        {item.product_name_snapshot ||
                          `Product #${item.product_id}`}
                      </Link>
                    ) : (
                      item.product_name_snapshot || `Item #${item.id}`
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order item #{item.order_item_id}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.product_id && <span>Product #{item.product_id}</span>}
                    {item.variant_id && (
                      <span>Original variant #{item.variant_id}</span>
                    )}
                    {item.old_variant_id && (
                      <span>Returned variant #{item.old_variant_id}</span>
                    )}
                    {item.new_variant_id && (
                      <span>New variant #{item.new_variant_id}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant="outline">
                Qty {item.accepted_quantity || 0}/{item.quantity}
              </Badge>
            </div>
            <Separator className="my-3" />
            <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Reason"
                value={item.return_reason || item.exchange_reason}
              />
              <Info label="Disposition" value={item.item_disposition} />
              <Info
                label="Old net unit"
                value={money(item.old_net_unit_price)}
              />
              <Info
                label="Variant snapshot"
                value={formatJsonish(item.variant_info_snapshot)}
              />
              {kind === 'return' ? (
                <>
                  <Info
                    label="Calculated refund"
                    value={money(item.calculated_refund_amount)}
                  />
                  <Info
                    label="Calculated VAT"
                    value={money(item.calculated_vat_refund_amount)}
                  />
                  <Info
                    label="Adjusted refund"
                    value={money(item.adjusted_refund_amount)}
                  />
                  <Info
                    label="Adjusted VAT"
                    value={money(item.adjusted_vat_refund_amount)}
                  />
                </>
              ) : (
                <>
                  <Info label="New variant" value={item.new_variant_id} />
                  <Info label="New variant SKU" value={item.new_variant_sku} />
                  <Info
                    label="New unit"
                    value={money(item.new_unit_price_snapshot)}
                  />
                  <Info label="Old value" value={money(item.old_value)} />
                  <Info label="New value" value={money(item.new_value)} />
                  <Info
                    label="Difference"
                    value={money(item.price_difference)}
                  />
                </>
              )}
              <Info label="Client note" value={item.client_note} />
              <Info label="Admin note" value={item.admin_note} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value ?? '-'}</p>
    </div>
  )
}

function ActionDialog({
  kind,
  request,
  dialog,
  pending,
  onChange,
  onSubmit,
}: {
  kind: WorkflowKind
  request: WorkflowRequest
  dialog: DialogState | null
  pending: boolean
  onChange: (dialog: DialogState | null) => void
  onSubmit: (dialog: DialogState) => void
}) {
  const action = dialog?.action
  const requiresReceivePayload = action === 'receive'
  const requiresNote =
    action === 'reject' ||
    action === 'waive-adjustment' ||
    action === 'refund' ||
    action === 'refund-difference'
  const fields = useMemo(
    () =>
      dialog
        ? buildActionFields({
            dialog,
            kind,
            pending,
            request,
            requiresNote,
            requiresReceivePayload,
            onCancel: () => onChange(null),
          })
        : [],
    [
      dialog,
      kind,
      onChange,
      pending,
      request,
      requiresNote,
      requiresReceivePayload,
    ],
  )

  return (
    <Dialog open={!!dialog} onOpenChange={(open) => !open && onChange(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{action ? labelAction(action) : 'Action'}</DialogTitle>
          <DialogDescription>
            Review the request carefully before submitting. Some values cannot
            be increased above API calculated limits.
          </DialogDescription>
        </DialogHeader>

        {dialog && (
          <AppForm<DialogState>
            schema={actionDialogSchema}
            fields={fields}
            values={dialog}
            onSubmit={onSubmit}
            showSubmitButton={false}
            gridColumns={2}
            spacing="lg"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function buildActionFields({
  dialog,
  kind,
  pending,
  request,
  requiresNote,
  requiresReceivePayload,
  onCancel,
}: {
  dialog: DialogState
  kind: WorkflowKind
  pending: boolean
  request: WorkflowRequest
  requiresNote: boolean
  requiresReceivePayload: boolean
  onCancel: () => void
}): Array<FieldProp<DialogState>> {
  const fields: Array<FieldProp<DialogState>> = []

  if (requiresReceivePayload) {
    dialog.items.forEach((item, index) => {
      const source = request.items[index] as any
      fields.push({
        type: 'custom',
        span: 2,
        customItem: (
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="font-bold">Item #{item.id}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Requested quantity: {source.quantity}
            </p>
          </div>
        ),
      })
      fields.push({
        type: 'number',
        name: `items.${index}.accepted_quantity` as any,
        label: 'Accepted quantity',
        inputProps: { min: 0, max: source.quantity },
      })
      fields.push({
        type: 'select',
        name: `items.${index}.disposition` as any,
        label: 'Disposition',
        inputProps: {
          placeholder: 'Select disposition',
          options: dispositions.map((disposition) => ({
            value: disposition,
            label: disposition.replace(/_/g, ' '),
          })),
        },
      })
      if (kind === 'return') {
        fields.push({
          type: 'number',
          name: `items.${index}.adjusted_refund_amount` as any,
          label: 'Adjusted refund amount',
          inputProps: { min: 0, max: source.calculated_refund_amount },
        })
        fields.push({
          type: 'number',
          name: `items.${index}.adjusted_vat_refund_amount` as any,
          label: 'Adjusted VAT refund',
          inputProps: { min: 0, max: source.calculated_vat_refund_amount },
        })
        fields.push({
          type: 'textarea',
          name: `items.${index}.refund_adjustment_reason` as any,
          label: 'Refund adjustment reason',
          span: 2,
        })
      }
      fields.push({
        type: 'textarea',
        name: `items.${index}.note` as any,
        label: 'Item note',
        span: 2,
      })
    })

    fields.push({
      type: 'number',
      name: 'shipping_amount',
      label:
        kind === 'return'
          ? 'Shipping refund amount'
          : 'Replacement shipping fee',
      inputProps: { min: 0 },
    })
    fields.push({
      type: 'textarea',
      name: 'shipping_reason',
      label:
        kind === 'return' ? 'Shipping refund reason' : 'Shipping fee reason',
    })
  }

  if (requiresNote || requiresReceivePayload) {
    if (dialog.action === 'refund' || dialog.action === 'refund-difference') {
      const amount = getRefundAmount(dialog.action, request)
      const options = getRefundOptions(request, amount)
      const destinationRows = [
        [
          'Original payment',
          options.original,
          'Refund through the captured payment gateway.',
        ],
        ['Wallet', options.wallet, 'Credit the customer wallet immediately.'],
        [
          'Manual',
          options.manual,
          'Record an offline refund handled outside the gateway.',
        ],
      ] as const
      fields.push({
        type: 'custom',
        span: 2,
        customItem: (
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold">Refund allocation</p>
                <p className="mt-1 text-muted-foreground">
                  Split exactly {money(amount)} across the available refund
                  destinations.
                </p>
              </div>
              <Badge variant="outline">
                Remaining {money(options.remaining)}
              </Badge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {destinationRows.map(([label, available, description]) => (
                <div
                  key={label}
                  className={cn(
                    'rounded-md border bg-background p-3',
                    available <= 0 && 'opacity-50',
                  )}
                >
                  <p className="font-medium">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                  <p className="mt-2 text-xs font-semibold">
                    Available {money(available)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ),
      })
      fields.push({
        type: 'number',
        name: 'wallet_refund_amount',
        label: 'Refund to wallet',
        inputProps: {
          min: 0,
          max: Math.min(amount, options.wallet),
          step: 0.01,
          disabled: options.wallet <= 0,
        },
      })
      fields.push({
        type: 'number',
        name: 'original_refund_amount',
        label: 'Refund to original payment',
        inputProps: {
          min: 0,
          max: Math.min(amount, options.original),
          step: 0.01,
          disabled: options.original <= 0,
        },
      })
      fields.push({
        type: 'number',
        name: 'manual_refund_amount',
        label: 'Manual refund',
        inputProps: {
          min: 0,
          max: Math.min(amount, options.manual),
          step: 0.01,
          disabled: options.manual <= 0,
        },
      })
    }
    fields.push({
      type: 'textarea',
      name: 'note',
      label: 'Admin note',
      span: 2,
    })
  }

  fields.push({
    type: 'custom',
    span: 2,
    customItem: (
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Submitting...' : 'Confirm'}
        </Button>
      </div>
    ),
  })

  return fields
}

function buildPayload(kind: WorkflowKind, dialog: DialogState) {
  if (dialog.action === 'receive') {
    return {
      items: dialog.items.map((item) => ({
        id: item.id,
        accepted_quantity: item.accepted_quantity,
        disposition: item.disposition,
        ...(kind === 'return'
          ? {
              adjusted_refund_amount: item.adjusted_refund_amount,
              adjusted_vat_refund_amount: item.adjusted_vat_refund_amount,
              refund_adjustment_reason: emptyToUndefined(
                item.refund_adjustment_reason,
              ),
            }
          : {}),
        note: emptyToUndefined(item.note),
      })),
      ...(kind === 'return'
        ? {
            shipping_refund_amount: dialog.shipping_amount,
            shipping_refund_reason: emptyToUndefined(dialog.shipping_reason),
          }
        : {
            replacement_shipping_fee: dialog.shipping_amount,
            shipping_fee_reason: emptyToUndefined(dialog.shipping_reason),
          }),
      note: emptyToUndefined(dialog.note),
    }
  }

  if (
    dialog.action === 'reject' ||
    dialog.action === 'refund' ||
    dialog.action === 'refund-difference' ||
    dialog.action === 'waive-adjustment'
  ) {
    if (dialog.action === 'refund' || dialog.action === 'refund-difference') {
      const refund_allocations = [
        dialog.wallet_refund_amount
          ? { destination: 'wallet', amount: dialog.wallet_refund_amount }
          : null,
        dialog.original_refund_amount
          ? {
              destination: 'original_payment',
              amount: dialog.original_refund_amount,
            }
          : null,
        dialog.manual_refund_amount
          ? { destination: 'manual', amount: dialog.manual_refund_amount }
          : null,
      ].filter(Boolean)
      return { note: emptyToUndefined(dialog.note), refund_allocations }
    }
    return { note: emptyToUndefined(dialog.note) }
  }

  return {}
}

function getRefundAmount(action: WorkflowAction, request: WorkflowRequest) {
  if (action === 'refund') return (request as ReturnRequest).final_refund_amount
  if (action === 'refund-difference')
    return Math.abs((request as ExchangeRequest).settlement_amount)
  return 0
}

function getRefundOptions(request: WorkflowRequest, amount: number) {
  const options = request.refund_options
  const remaining = roundMoney(options?.remaining_refundable_amount ?? amount)
  return {
    remaining,
    original: roundMoney(options?.original_payment_available_amount ?? amount),
    wallet: roundMoney(options?.wallet_available_amount ?? remaining),
    manual: roundMoney(options?.manual_available_amount ?? remaining),
  }
}

function getDefaultRefundAllocation(request: WorkflowRequest, amount: number) {
  if (amount <= 0) return { wallet: 0, original: 0, manual: 0 }
  const options = getRefundOptions(request, amount)
  const original = Math.min(amount, options.original)
  const afterOriginal = roundMoney(amount - original)
  const wallet = Math.min(afterOriginal, options.wallet)
  const afterWallet = roundMoney(afterOriginal - wallet)
  const manual = Math.min(afterWallet, options.manual)

  return {
    wallet: roundMoney(wallet),
    original: roundMoney(original),
    manual: roundMoney(manual),
  }
}

function roundMoney(value: number) {
  return Number(value.toFixed(2))
}

function getAvailableActions(
  kind: WorkflowKind,
  request: WorkflowRequest,
): Array<WorkflowAction> {
  if (kind === 'return') {
    const item = request as ReturnRequest
    const actions: Array<WorkflowAction> = []
    if (item.status === RETURN_REQUEST_STATUSES.requested)
      actions.push('approve', 'reject')
    if (item.status === RETURN_REQUEST_STATUSES.approved)
      actions.push('receive')
    if (
      item.status === RETURN_REQUEST_STATUSES.itemReceived &&
      [REFUND_STATUSES.requiresRefund, REFUND_STATUSES.requiresReview].includes(
        item.refund_status as never,
      )
    ) {
      actions.push('refund')
    }
    if (
      item.status === RETURN_REQUEST_STATUSES.refunded ||
      item.refund_status === REFUND_STATUSES.waived
    ) {
      actions.push('complete')
    }
    return actions
  }

  const item = request as ExchangeRequest
  const actions: Array<WorkflowAction> = []
  if (item.status === EXCHANGE_REQUEST_STATUSES.requested)
    actions.push('approve', 'reject')
  if (item.status === EXCHANGE_REQUEST_STATUSES.requiresReview)
    actions.push('retry-reservation', 'reject')
  if (item.status === EXCHANGE_REQUEST_STATUSES.approved) {
    actions.push('receive')
    if (
      item.replacement_expires_at &&
      new Date(item.replacement_expires_at).getTime() <= Date.now()
    ) {
      actions.push('release-expired')
    }
  }
  if (item.status === EXCHANGE_REQUEST_STATUSES.itemReceived) {
    if (
      item.price_adjustment_status === PRICE_ADJUSTMENT_STATUSES.requiresRefund
    ) {
      actions.push('refund-difference', 'waive-adjustment')
    }
    if (
      item.price_adjustment_status === PRICE_ADJUSTMENT_STATUSES.requiresPayment
    ) {
      actions.push('waive-adjustment')
    }
    if (
      [
        PRICE_ADJUSTMENT_STATUSES.none,
        PRICE_ADJUSTMENT_STATUSES.paid,
        PRICE_ADJUSTMENT_STATUSES.refunded,
        PRICE_ADJUSTMENT_STATUSES.waived,
      ].includes(item.price_adjustment_status as never)
    ) {
      actions.push('ship')
    }
  }
  if (item.status === EXCHANGE_REQUEST_STATUSES.replacementShipped)
    actions.push('complete')
  return actions
}

function labelAction(action: WorkflowAction) {
  return action
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function emptyToUndefined(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function money(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)} SAR`
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function formatJsonish(value: unknown) {
  if (!value) return '-'
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${String(val)}`)
      .join(', ')
  }
  return String(value)
}
