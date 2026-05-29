import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Edit, Eye } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { HasPermission } from '@/components/common/HasPermission'

export type PaymentGatewayEntity = {
    id: number
    identifier: string
    name: string
    description: string
    image: string | null
    icon: string | null
    settings: Record<string, string>
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

export const paymentGatewayColumns = (
    open: (type: PickedAction, row: PaymentGatewayEntity) => void,
): ColumnDef<PaymentGatewayEntity>[] => [
        imageColumn<PaymentGatewayEntity>('image' as any, 'Form.labels.image'),
        textColumn<PaymentGatewayEntity>('name', 'Form.labels.name'),
        // textColumn<PaymentGatewayEntity>('identifier', 'Form.labels.identifier'),
        DateColumn<PaymentGatewayEntity>('created_at', 'table.createdAt'),
        booleanControlColumn<PaymentGatewayEntity>('is_active', 'table.status', open, 'active', false, 'payment-gateways'),
        textColumn<PaymentGatewayEntity>('id', 'actions.show', {
            render: ({ row }) => <HasPermission entity="payment-gateways" action="show"><Button variant="ghost" onClick={() => open('show' as any, row.original)}><Eye /></Button></HasPermission>,
        }),
        textColumn<PaymentGatewayEntity>('id', 'actions.edit', {
            render: ({ row }) => <HasPermission entity="payment-gateways" action="update"><Button variant="ghost" onClick={() => open('edit' as any, row.original)}><Edit /></Button></HasPermission>,
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
