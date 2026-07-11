import { Edit, Eye } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import type { ColumnDef } from '@tanstack/react-table'
import type { PickedAction } from '@/hooks/useStatusMutations'
import {
  DateColumn,
  booleanControlColumn,
  imageColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { HasPermission } from '@/components/common/HasPermission'

export type PaymentGatewayEntity = {
  id: number | string
  identifier: string
  provider?: string
  name: string
  description: string
  image: string | null
  icon: string | null
  settings: Record<string, string>
  enabled_methods?: Array<string>
  supported_countries?: Array<string>
  supported_currencies?: Array<string>
  environment?: string
  priority?: number
  is_active: boolean
  created_at: string
  en?: {
    name: string
    description: string
  }
  ar?: {
    name: string
    description: string
  }
}

const gatewayImageSrc = (row: PaymentGatewayEntity) =>
  row.image ||
  row.icon ||
  row.settings.logo_url ||
  row.settings.icon_url ||
  null

export const paymentGatewayColumns = (
  open: (type: PickedAction, row: PaymentGatewayEntity) => void,
): Array<ColumnDef<PaymentGatewayEntity>> => [
  imageColumn<PaymentGatewayEntity>('image', 'Form.labels.image', {
    render: ({ row }) => {
      const src = gatewayImageSrc(row.original)
      return src ? (
        <img
          src={src}
          alt={row.original.name}
          className="h-10 w-20 rounded-md border border-border bg-background object-contain p-1"
        />
      ) : (
        <div className="flex h-10 w-20 items-center justify-center rounded-md border border-border bg-muted text-xs text-muted-foreground">
          {row.original.provider || row.original.identifier}
        </div>
      )
    },
  }),
  textColumn<PaymentGatewayEntity>('name', 'Form.labels.name'),
  // textColumn<PaymentGatewayEntity>('identifier', 'Form.labels.identifier'),
  DateColumn<PaymentGatewayEntity>('created_at', 'table.createdAt'),
  booleanControlColumn<PaymentGatewayEntity>(
    'is_active',
    'table.status',
    open,
    'active',
    false,
    'payment-gateways',
  ),
  textColumn<PaymentGatewayEntity>('id', 'actions.show', {
    render: ({ row }) => (
      <HasPermission entity="payment-gateways" action="show">
        <Button
          variant="ghost"
          onClick={() => open('show' as any, row.original)}
        >
          <Eye />
        </Button>
      </HasPermission>
    ),
  }),
  textColumn<PaymentGatewayEntity>('id', 'actions.edit', {
    render: ({ row }) => (
      <HasPermission entity="payment-gateways" action="update">
        <Button
          variant="ghost"
          onClick={() => open('edit' as any, row.original)}
        >
          <Edit />
        </Button>
      </HasPermission>
    ),
  }),
]

// export const paymentGatewayActions = (
//     t: (key: string) => string,
//     open: (type: PickedAction | 'edit', row: PaymentGatewayEntity) => void,
// ) => [
//         {
//             label: t('actions.edit'),
//             onClick: (row: PaymentGatewayEntity) => open('edit' as any, row),
//         },
//         {
//             label: (row: PaymentGatewayEntity) =>
//                 t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
//             onClick: (row: PaymentGatewayEntity) => open('active', row),
//         },
//     ]
