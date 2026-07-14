import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { FieldProp } from '@/types/components/form'
import type {ChangePasswordFormData} from '@/lib/schema';
import type { ApiResponse } from '@/types/api/http'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import {
  
  buildChangePasswordSchema
} from '@/lib/schema'
import { ADMIN_AUTH_HEADERS } from '@/lib/dashboard-session'

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const schema = buildChangePasswordSchema(t)
  const [formVersion, setFormVersion] = useState(0)

  const fields: Array<FieldProp<ChangePasswordFormData>> = [
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

  const { mutateAsync, isPending } = useMutate<
    ApiResponse,
    { current_password: string; new_password: string }
  >({
    mutationKey: ['auth', 'change-password'],
    endpoint: 'auth/change-password',
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    onSuccess: () => setFormVersion((version) => version + 1),
  })

  const handleSubmit = async (values: ChangePasswordFormData) => {
    await mutateAsync({
      current_password: values.current_password,
      new_password: values.password,
    })
  }

  return (
    <AppForm<ChangePasswordFormData>
      key={formVersion}
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
