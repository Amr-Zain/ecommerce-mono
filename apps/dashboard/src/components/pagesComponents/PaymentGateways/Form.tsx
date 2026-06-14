import { PaymentGatewayEntity } from './Config'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { z } from 'zod/v4'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@ecommerce/ui/components/alert'
import { TriangleAlert } from 'lucide-react'
import { useAlertModal } from '@/stores/useAlertModal'

interface PaymentGatewayFormProps {
    id: number
    onSuccess: () => void
}

export const PaymentGatewayForm = ({ id, onSuccess }: PaymentGatewayFormProps) => {
    const { t } = useTranslation()
    const alert = useAlertModal()

    // Fetch details to get translations (ar, en)
    const { data: detailsResponse, isLoading: detailsLoading } = useFetch<ApiResponseBase<PaymentGatewayEntity>>({
        endpoint: `payment-gateways/${id}`,
        queryKey: queryKeys.paymentGateways.getPaymentGateway(id),
    })

    const initialData = detailsResponse?.data

    const { mutateAsync: update, isPending } = useMutate({
        endpoint: `payment-gateways/${id}`,
        method: 'patch',
        invalidates: [queryKeys.paymentGateways.all(), queryKeys.paymentGateways.getPaymentGateway(id)],
        mutationKey: queryKeys.paymentGateways.getPaymentGateway(id),
        onSuccess: () => onSuccess(),
    })

    const initialValues = useMemo(() => {
        if (!initialData) return {}
        return {
            ...generateInitialValues(initialData),
            ...initialData.settings,
            is_active: !!initialData.is_active,
            image: initialData.image,
            icon: initialData.icon,
        }
    }, [initialData])

    const fields = useMemo(() => {
        if (!initialData) return []
        const baseFields: any[] = [
            {
                name: 'image',
                label: t('Form.labels.image'),
                type: 'imgUploader',
                span: 2,
                inputProps: {
                    maxFiles: 1,
                    acceptedFileTypes: ['image/*'],
                    model: 'paymentgateway',
                    collection: 'image',
                },
            },
            {
                type: 'multiLangField',
                name: 'name',
                label: t('Form.labels.name'),
                placeholder: t('Form.placeholders.name'),
                span: 2,
            },
            {
                type: 'multiLangField',
                name: 'description',
                label: t('Form.labels.description'),
                placeholder: t('Form.placeholders.description'),
                inputProps: {
                    type: 'textarea'
                },
                span: 2,
            },
            {
                name: 'is_active',
                label: t('Form.labels.isActive'),
                type: 'checkbox',

                span: 2,
            },
            {
                type: 'custom',
                customItem: (
                    <Alert variant="destructive" className="border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/20 dark:text-orange-200">
                        <TriangleAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <AlertTitle className="font-bold">{t('paymentGateways.warning_title')}</AlertTitle>
                        <AlertDescription>
                            {t('paymentGateways.warning_message')}
                        </AlertDescription>
                    </Alert>
                ),
                span: 2,
            },
        ]

        const settingsFields = Object.keys(initialData.settings || {}).map((key) => ({
            name: `${key}`,
            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            type: 'text',
            placeholder: `Enter ${key}`,
            span: 2,
        }))

        return [...baseFields, ...settingsFields]
    }, [initialData, t])

    const handleSubmit = async (values: any) => {
        const finalOut = generateFinalOut(initialData, values)

        // Prepare settings as a nested object
        const settings: any = {}
        let settingsChanged = false
        Object.keys(initialData?.settings || {}).forEach(key => {
            if (values[key] !== undefined) {
                if (String(values[key]) !== String(initialData?.settings[key])) {
                    settingsChanged = true
                }
                settings[key] = values[key]
            }
        })

        const payload: any = {
            ...finalOut,
            is_active: values.is_active ? 1 : 0,
            image: (values.image && typeof values.image === 'object') ? (values.image?.hash ?? values.image?.uid) : (values.image || null),
            icon: (values.icon && typeof values.icon === 'object') ? (values.icon?.hash ?? values.icon?.uid) : (values.icon || null),
            settings: settings,
        }

        // Clean up read-only or redundant fields that might cause backend issues
        delete payload.id
        delete payload.identifier
        delete payload.integration_id
        delete payload.public_key
        delete payload.secret_key
        delete payload.created_at

        const executeUpdate = async () => {
            try {
                await update(payload)
                alert.setIsOpen(false)
            } catch (error) {
                // Error handled in useMutate
            }
        }

        if (settingsChanged) {
            alert.setModel({
                isOpen: true,
                title: t('paymentGateways.confirm_update_title'),
                desc: t('paymentGateways.confirm_update_message'),
                variant: 'destructive',
                handleConfirm: executeUpdate,
            })
            alert.setHandler(executeUpdate)
        } else {
            await executeUpdate()
        }
    }

    const schema = useMemo(() => z.any(), [])

    if (detailsLoading) {
        return (
            <div className="px-4 py-2">
                <Skeleton className="h-[80vh] w-full rounded-lg" />
            </div>
        )
    }

    return (
        <div className="max-h-[80vh] overflow-y-auto px-4">
            <AppForm
                schema={schema}
                fields={fields as any}
                defaultValues={initialValues}
                onSubmit={handleSubmit}
                isLoading={isPending}
                gridColumns={2}
                spacing="md"
                submitButtonText={t('buttons.save')}
            />
        </div>
    )
}
