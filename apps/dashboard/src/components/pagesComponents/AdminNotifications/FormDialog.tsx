import * as React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { buildAdminNotificationFields } from './Config'
import { AdminNotificationFormData, makeAdminNotificationSchema } from '@/lib/schema'
import { useForm } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { generateFinalOut } from '@/util/helpers'
import { adminNotificationsQueryKeys } from '@/util/queryKeysFactory'

type FormDialogProps = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function FormDialog({
    isOpen,
    setIsOpen,
}: FormDialogProps) {
    const { t } = useTranslation()

    const schema = makeAdminNotificationSchema(t)
    const form = useForm<AdminNotificationFormData>({
        resolver: zodFormResolver(schema),
        defaultValues: {
            target_scope: 'all'
        }
    })

    const target_scope = form.watch('target_scope')

    const allFields = buildAdminNotificationFields(t)

    const fields = React.useMemo(() => {
        return allFields.filter(f => {
            if (f.name === 'target_ids') {
                const isUserScope = ['specific', 'clients', 'admins'].includes(target_scope)
                if (isUserScope && target_scope === 'admins') {
                    // switch endpoint for admins
                    if (f.type === 'select' && f.inputProps) {
                        f.inputProps.endpoint = 'supervisors'
                        f.inputProps.select = (res: any) => res.data?.map((u: any) => ({ label: u.name, value: String(u.id) })) || []
                    }
                } else if (isUserScope) {
                    if (f.type === 'select' && f.inputProps) {
                        f.inputProps.endpoint = 'users'
                        f.inputProps.select = (res: any) => res.data?.map((u: any) => ({
                            label: u.full_name || u.name,
                            value: String(u.id)
                        })) || []
                    }
                }
                return isUserScope
            }
            if (f.name === 'country_id') return ['country', 'country_clients'].includes(target_scope)
            if (f.name === 'city_id') return target_scope === 'city'
            return true
        })
    }, [target_scope, allFields])

    const { mutate, isPending } = useMutate({
        endpoint: 'admin-notifications',
        mutationKey: ['admin-notifications', 'create'],
        method: 'post',
        mutationOptions: {
            meta: { invalidates: [adminNotificationsQueryKeys.all()] }
        },
        onSuccess: (data: ApiResponse) => {
            toast.success(data.message)
            setIsOpen(false)
            form.reset()
        },
        onError: (_err, normalized) => {
            toast.error(normalized.message)
        },
    })

    const onSubmit = (values: AdminNotificationFormData) => {
        const out = generateFinalOut(null, values)
        const payload = {
            target: {
                scope: out.target_scope,
                ids: out.target_ids,
                country_id: out.country_id,
                city_id: out.city_id,
            },
            content: {
                ar: out.ar,
                en: out.en,
            }
        }
        mutate(payload)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) form.reset()
        }}>
            <DialogContent className="max-w-4xl p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {t('actions.create', { entity: t('admin_notifications.entity') })}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto px-6 pb-6">
                    <AppForm<AdminNotificationFormData>
                        providedForm={form as any}
                        schema={schema as any}
                        fields={fields}
                        onSubmit={onSubmit}
                        isLoading={isPending}
                        gridColumns={2}
                        spacing="md"
                        submitButtonText={t('buttons.add')}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
