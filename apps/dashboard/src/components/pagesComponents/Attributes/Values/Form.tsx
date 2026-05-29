import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import {
  buildValueFields,
  ValueDetails,
} from './Config'
import { attributeQueryKeys, attributeValueQueryKeys } from '@/util/queryKeysFactory'
import { makeValueSchema, ValueFormData } from '@/lib/schema'

export default function ValueForm({
  valueItem,
  attribute_id,
  onDone,
}: {
  valueItem?: ValueDetails
  attribute_id?: number | string | null
  onDone?: () => void
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const hasAttrIdProp =
    attribute_id !== null &&
    attribute_id !== undefined &&
    String(attribute_id).trim() !== ''

  // base schema from config
  const baseSchema = makeValueSchema(t) as any
  // if attribute_id is provided, strip it from schema validation
  const schema =
    hasAttrIdProp && typeof baseSchema?.omit === 'function'
      ? baseSchema.omit({ attribute_id: true })
      : baseSchema

  // fields to render
  const allFields = buildValueFields(t)
  const fields = hasAttrIdProp
    ? allFields.filter((f: any) => f?.name !== 'attribute_id')
    : allFields

  const attrIdString =
    (hasAttrIdProp
      ? String(attribute_id)
      : valueItem?.attribute?.id?.toString()) ?? ''

  const { mutate, isPending } = useMutate({
    endpoint: valueItem ? `attribute-values/${valueItem.id}` : 'attribute-values',
    method: valueItem?.id ? 'patch' : 'post',
    mutationKey: attributeValueQueryKeys.getValue(
      String(valueItem?.id ?? 'new'),
    ),
    mutationOptions: {
      meta: {
        invalidates: [
          attributeValueQueryKeys.all(),
          attributeQueryKeys.getAttribute(attrIdString),
        ],
      },
    },
    onSuccess: (data: ApiResponse) => {
      if (onDone) onDone()
      else navigate({ to: '/attributes/values' as any })
      toast.success(data.message)
    },
    onError: (_e, normalized) => toast.error(normalized.message),
  })

  const handleSubmit = (values: ValueFormData) => {
    const finalOut = generateFinalOut(valueItem, values)
    // ensure attribute_id comes from prop when provided
    finalOut.attribute_id = hasAttrIdProp ? attrIdString : finalOut.attribute_id
    mutate(finalOut )
  }

  return (
    <AppForm<ValueFormData>
      schema={schema}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(valueItem),
        attribute_id: attrIdString,
        is_active: valueItem?.is_active ?? false,
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        valueItem
          ? t('actions.update', { entity: t('common.value') })
          : t('actions.create', { entity: t('common.value') })
      }
    />
  )
}
