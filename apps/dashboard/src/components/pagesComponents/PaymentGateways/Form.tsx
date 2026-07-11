import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { z } from 'zod/v4'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@ecommerce/ui/components/alert'
import { TriangleAlert } from 'lucide-react'
import { unwrapOne } from './response'
import type { PaymentGatewayEntity } from './Config'
import type { ApiResponseBase } from '@/types/api/http'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import useFetch from '@/hooks/UseFetch'
import { useAlertModal } from '@/stores/useAlertModal'

interface PaymentGatewayFormProps {
  id: number | string
  onSuccess: () => void
}

export const PaymentGatewayForm = ({
  id,
  onSuccess,
}: PaymentGatewayFormProps) => {
  const { t } = useTranslation()
  const alert = useAlertModal()

  // Fetch details to get translations (ar, en)
  const { data: detailsResponse } = useFetch<
    ApiResponseBase<PaymentGatewayEntity> | undefined
  >({
    endpoint: `payment-gateways/${id}`,
    queryKey: queryKeys.paymentGateways.getPaymentGateway(id),
  })

  const initialData = unwrapOne<PaymentGatewayEntity>(detailsResponse)
  const settings = initialData?.settings ?? {}

  const { mutateAsync: update, isPending } = useMutate({
    endpoint: `payment-gateways/${id}`,
    method: 'patch',
    invalidates: [
      queryKeys.paymentGateways.all(),
      queryKeys.paymentGateways.getPaymentGateway(id),
    ],
    mutationKey: queryKeys.paymentGateways.getPaymentGateway(id),
    onSuccess: () => onSuccess(),
  })

  const initialValues = useMemo(() => {
    if (!initialData) return {}
    return {
      ...generateInitialValues(initialData),
      ...settings,
      environment: initialData.environment || settings.environment || 'test',
      priority: initialData.priority ?? 100,
      enabled_methods: (initialData.enabled_methods || []).join(','),
      supported_countries: (
        (initialData as any).supported_countries || []
      ).join(','),
      supported_currencies: (
        (initialData as any).supported_currencies || []
      ).join(','),
      is_active: !!initialData.is_active,
      image: initialData.image,
      icon: initialData.icon,
    }
  }, [initialData, settings])

  const fields = useMemo(() => {
    if (!initialData) return []
    const baseFields: Array<any> = [
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
          type: 'textarea',
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
        name: 'environment',
        label: 'Environment',
        type: 'text',
        placeholder: 'test',
        span: 1,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'number',
        placeholder: '100',
        span: 1,
      },
      {
        name: 'enabled_methods',
        label: 'Enabled methods',
        type: 'text',
        placeholder: 'card,apple_pay,mada,stc_pay',
        span: 2,
      },
      {
        name: 'supported_countries',
        label: 'Supported countries',
        type: 'text',
        placeholder: 'SA,EG,AE',
        span: 1,
      },
      {
        name: 'supported_currencies',
        label: 'Supported currencies',
        type: 'text',
        placeholder: 'SAR,EGP,AED',
        span: 1,
      },
      {
        type: 'custom',
        customItem: (
          <Alert
            variant="destructive"
            className="border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/20 dark:text-orange-200"
          >
            <TriangleAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertTitle className="font-bold">
              {t('paymentGateways.warning_title')}
            </AlertTitle>
            <AlertDescription>
              {t('paymentGateways.warning_message')}
            </AlertDescription>
          </Alert>
        ),
        span: 2,
      },
    ]

    const explicitFields = new Set([
      'enabled_methods',
      'environment',
      'priority',
      'supported_countries',
      'supported_currencies',
    ])
    const settingsFields = Object.keys(settings)
      .filter((key) => !explicitFields.has(key))
      .map((key) => ({
        name: `${key}`,
        label: key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        type: 'text',
        placeholder: `Enter ${key}`,
        span: 2,
      }))

    return [...baseFields, ...settingsFields]
  }, [initialData, settings, t])

  const handleSubmit = async (values: any) => {
    if (!initialData) return
    const finalOut = generateFinalOut(initialData, values)

    // Prepare settings as a nested object
    const settingsPayload: any = {}
    Object.keys(settings).forEach((key) => {
      if (values[key] !== undefined) {
        settingsPayload[key] = values[key]
      }
    })
    const settingsChanged = Object.keys(settingsPayload).some(
      (key) => String(settingsPayload[key]) !== String(settings[key]),
    )

    const payload: any = {
      ...finalOut,
      is_active: values.is_active ? 1 : 0,
      image:
        values.image && typeof values.image === 'object'
          ? (values.image?.hash ?? values.image?.uid)
          : values.image || null,
      icon:
        values.icon && typeof values.icon === 'object'
          ? (values.icon?.hash ?? values.icon?.uid)
          : values.icon || null,
      environment: values.environment,
      priority: Number(values.priority || 100),
      enabled_methods: values.enabled_methods,
      supported_countries: values.supported_countries,
      supported_currencies: values.supported_currencies,
      settings: settingsPayload,
    }

    // Clean up read-only or redundant fields that might cause backend issues
    delete payload.id
    delete payload.identifier
    delete payload.integration_id
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

  if (!initialData) {
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
