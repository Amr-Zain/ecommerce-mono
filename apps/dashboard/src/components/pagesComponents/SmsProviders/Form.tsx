import { SmsProviderEntity } from './Config'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { z } from 'zod/v4'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import useFetch from '@/hooks/UseFetch'
import { ApiResponseBase } from '@/types/api/http'
import { Alert, AlertDescription, AlertTitle } from '@ecommerce/ui/components/alert'
import { TriangleAlert, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAlertModal } from '@/stores/useAlertModal'
import { useForm, useWatch } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { Input } from '@ecommerce/ui/components/input'
import { Button } from '@ecommerce/ui/components/button'
import { FormLabel } from '@ecommerce/ui/components/form'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

interface SmsProviderFormProps {
    id: number
    onSuccess: () => void
}

export const SmsProviderForm = ({ id, onSuccess }: SmsProviderFormProps) => {
    const { t } = useTranslation()
    const alert = useAlertModal()

    // Fetch details to get translations (ar, en)
    const { data: detailsResponse, isLoading: detailsLoading } = useFetch<ApiResponseBase<SmsProviderEntity>>({
        endpoint: `sms-providers/${id}`,
        queryKey: queryKeys.smsProviders.getSmsProvider(id),
    })

    const initialData = detailsResponse?.data

    const { mutateAsync: update, isPending } = useMutate({
        endpoint: `sms-providers/${id}`,
        method: 'patch',
        invalidates: [queryKeys.smsProviders.all(), queryKeys.smsProviders.getSmsProvider(id)],
        mutationKey: queryKeys.smsProviders.getSmsProvider(id),
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
            generate_loyalty_bridge_token: initialData.settings?.generate_loyalty_bridge_token === undefined ? true : !!initialData.settings?.generate_loyalty_bridge_token,
            loyalty_bridge_token: initialData.settings?.loyalty_bridge_token || '',
        }
    }, [initialData])

    const schema = useMemo(() => z.any(), [])

    const form = useForm<any>({
        resolver: zodFormResolver(schema),
        values: initialValues,
    })

    const generateLBT = useWatch({
        control: form.control,
        name: 'generate_loyalty_bridge_token' as any,
    })

    const [hasConfirmedTokenEdit, setHasConfirmedTokenEdit] = useState(false)

    const generateRandomLBT = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = 'lbt_'
        for (let i = 0; i < 48; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }

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
                    model: 'smsprovider',
                    collection: 'image',
                },
            },
            {
                name: 'icon',
                label: t('Form.labels.icon'),
                type: 'imgUploader',
                span: 2,
                inputProps: {
                    maxFiles: 1,
                    acceptedFileTypes: ['image/*'],
                    model: 'smsprovider',
                    collection: 'icon',
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
                name: 'generate_loyalty_bridge_token',
                label: t('Form.labels.generate_loyalty_bridge_token'),
                type: 'switch',
                span: 2,
            },
            {
                name: 'loyalty_bridge_token',
                type: 'custom',
                customItem: (
                    <AnimatePresence initial={false}>
                        {!generateLBT && (
                            <motion.div
                                key="loyalty_bridge_token_field"
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div className="space-y-2">
                                    <FormLabel>{t('Form.labels.loyalty_bridge_token')}</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            {...form.register('loyalty_bridge_token' as any)}
                                            placeholder={t('Form.placeholders.loyalty_bridge_token')}
                                            disabled
                                            className="disabled:opacity-70"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="h-12! w-12!"
                                            onClick={() => {
                                                if (!hasConfirmedTokenEdit) {
                                                    const onConfirm = async () => {
                                                        setHasConfirmedTokenEdit(true)
                                                        form.setValue('loyalty_bridge_token' as any, generateRandomLBT())
                                                        alert.setIsOpen(false)
                                                    }
                                                    alert.setModel({
                                                        isOpen: true,
                                                        title: t('smsProviders.confirm_generate_token_title') || 'Generate New Token',
                                                        desc: t('smsProviders.confirm_generate_token_message') || 'Are you sure you want to generate a new loyalty bridge token? This will replace the current token and may affect existing integrations.',
                                                        variant: 'destructive',
                                                        handleConfirm: onConfirm,
                                                    })
                                                    alert.setHandler(onConfirm)
                                                } else {
                                                    form.setValue('loyalty_bridge_token' as any, generateRandomLBT())
                                                }
                                            }}
                                            title="Generate Random Token"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ),
                span: 2,
            },
            {
                type: 'custom',
                customItem: (
                    <Alert variant="destructive" className="border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/20 dark:text-orange-200">
                        <TriangleAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <AlertTitle className="font-bold">{t('smsProviders.warning_title')}</AlertTitle>
                        <AlertDescription>
                            {t('smsProviders.warning_message')}
                        </AlertDescription>
                    </Alert>
                ),
                span: 2,
            },
        ]

        const knownKeys = ['user', 'base_url', 'password', 'sender_id', 'api_token', 'notification_token', 'generate_loyalty_bridge_token', 'loyalty_bridge_token']
        const allSettingsKeys = Array.from(new Set([...Object.keys(initialData.settings || {}), ...knownKeys]))

        const settingsFields = allSettingsKeys
            .filter(key => key !== 'generate_loyalty_bridge_token' && key !== 'loyalty_bridge_token')
            .map((key) => ({
                name: `${key}`,
                label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                type: 'text',
                placeholder: `Enter ${key}`,
                span: 2,
            }))

        return [...baseFields, ...settingsFields]
    }, [initialData, t, generateLBT, form, hasConfirmedTokenEdit])

    const handleSubmit = async (values: any) => {
        const finalOut = generateFinalOut(initialData, values)

        // Prepare settings as a nested object
        const settings: any = {}
        let settingsChanged = false

        const knownKeys = ['user', 'base_url', 'password', 'sender_id', 'api_token', 'notification_token', 'generate_loyalty_bridge_token', 'loyalty_bridge_token']
        const allSettingsKeys = Array.from(new Set([...Object.keys(initialData?.settings || {}), ...knownKeys]))

        allSettingsKeys.forEach(key => {
            if (values[key] !== undefined) {
                if (String(values[key]) !== String(initialData?.settings?.[key] ?? '')) {
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
        delete payload.created_at
        delete payload.updated_at

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
                title: t('smsProviders.confirm_update_title'),
                desc: t('smsProviders.confirm_update_message'),
                variant: 'destructive',
                handleConfirm: executeUpdate,
            })
            alert.setHandler(executeUpdate)
        } else {
            await executeUpdate()
        }
    }


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
                providedForm={form}
                schema={schema}
                fields={fields as any}
                onSubmit={handleSubmit}
                isLoading={isPending}
                gridColumns={2}
                spacing="md"
                submitButtonText={t('buttons.save')}
            />
        </div>
    )
}
