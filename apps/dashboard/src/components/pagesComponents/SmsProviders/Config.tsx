import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { Edit } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { HasPermission } from '@/components/common/HasPermission'

export type SmsProviderEntity = {
    id: number
    identifier: string
    name: string
    description: string
    image: string | null
    icon: string | null
    settings: Record<string, string>
    is_active: boolean
    created_at: string
    updated_at?: string
    en?: {
        name: string
        description: string
    }
    ar?: {
        name: string
        description: string
    }
}

export const smsProviderColumns = (
    open: (type: PickedAction, row: SmsProviderEntity) => void,
): ColumnDef<SmsProviderEntity>[] => [
        imageColumn<SmsProviderEntity>('image' as any, 'Form.labels.image'),
        textColumn<SmsProviderEntity>('name', 'Form.labels.name'),
        // textColumn<SmsProviderEntity>('identifier', 'Form.labels.identifier'),
        DateColumn<SmsProviderEntity>('created_at', 'table.createdAt'),
        booleanControlColumn<SmsProviderEntity>('is_active', 'table.status', open, 'active', false, 'sms-providers'),
        textColumn<SmsProviderEntity>('id', 'actions.edit', {
            render: ({ row }) => <HasPermission entity="sms-providers" action="update"><Button variant="ghost" onClick={() => open('edit' as any, row.original)}><Edit /></Button></HasPermission>,
        }),
    ]
