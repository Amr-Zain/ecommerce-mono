import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import {
  AttributeShow,
  buildAttributeFields,
} from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { AttributeFormData, makeAttributeSchema } from '@/lib/schema'

export default function AttributeForm({ attribute, onDone }: { attribute?: AttributeShow; onDone?: () => void }) {
  const { t } = useTranslation()
  const schema = makeAttributeSchema(t)
  const fields = buildAttributeFields(t)

  const { mutate, isPending } = useMutate({
    endpoint: attribute ? `attributes/${attribute.id}` : 'attributes',
    mutationKey: queryKeys.attributes.getAttribute(
      String(attribute?.id ?? 'new'),
    ),
    method: attribute ? 'patch' : 'post',
    invalidates: [queryKeys.attributes.all()],
    redirectTo: onDone ? undefined : '/attributes',
    onSuccess: onDone ? () => onDone() : undefined,
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
