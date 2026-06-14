import { useTranslation } from 'react-i18next'
import AppForm from '@/components/common/form/AppForm'
import { FieldProp } from '@/types/components/form'
import { useMutate } from '@/hooks/UseMutate'
import {
  buildChangePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/schema'
import { ApiResponse } from '@/types/api/http'

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const schema = buildChangePasswordSchema(t) 

  const fields: FieldProp<ChangePasswordFormData>[] = [
    {
      type: 'password',
      name: 'current_password',
      label: t('Form.labels.currentPassword'),
      placeholder: t('Form.placeholders.password'),
      span: 2,
    },
    {
      type: 'password',
      name: 'password',
      label: t('Form.labels.newPassword'),
      placeholder: t('Form.placeholders.newPassword'),
    },
    {
      type: 'password',
      name: 'password_confirmation',
      label: t('Form.labels.confirmPassword'),
      placeholder: t('Form.placeholders.confirmPassword'),
    },
  ]

  const { mutate, isPending } = useMutate<ApiResponse, any>({
    mutationKey: ['profile/change-password'],
    endpoint: 'profile/change-password',
    formData: true,
    method: 'post',
  })

  const handleSubmit = (values: ChangePasswordFormData) => {
    mutate(values)
  }

  return (
    <AppForm<ChangePasswordFormData>
      schema={schema}
      fields={fields}
      defaultValues={{
        current_password: '',
        password: '',
        password_confirmation: '',
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={t('buttons.confirm')}
    />
  )
}
