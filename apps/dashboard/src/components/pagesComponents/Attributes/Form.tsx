import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import {
  AttributeShow,
  buildAttributeFields,
} from './Config'
import { attributeQueryKeys } from '@/util/queryKeysFactory'
import { AttributeFormData, makeAttributeSchema } from '@/lib/schema'

export default function AttributeForm({ attribute, onDone }: { attribute?: AttributeShow; onDone?: () => void }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const schema = makeAttributeSchema(t)
  const fields = buildAttributeFields(t)

  const { mutate, isPending } = useMutate({
    endpoint: attribute ? `attributes/${attribute.id}` : 'attributes',
    mutationKey: attributeQueryKeys.getAttribute(
      String(attribute?.id ?? 'new'),
    ),
    method: attribute ? 'patch' : 'post',
    mutationOptions: { meta: { invalidates: [attributeQueryKeys.all()] } },
    onSuccess: (data: ApiResponse) => {
      if (onDone) onDone()
      else
        navigate({ to: '/attributes' } as any)

      toast.success(data.message)
    },
    onError: (_e, normalized) => toast.error(normalized.message),
  })

  const handleSubmit = (values: AttributeFormData) => {
    const finalOut = generateFinalOut(attribute, values)
    mutate({
      ...finalOut,
    })
  }

  return (
    <AppForm<AttributeFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(attribute),
        is_active: attribute?.is_active ?? false,
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        attribute
          ? t('actions.update', { entity: t('common.attribute') })
          : t('actions.create', { entity: t('common.attribute') })
      }
    />
  )
}
