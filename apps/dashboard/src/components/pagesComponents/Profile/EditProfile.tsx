import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { ApiResponseBase } from '@/types/api/http'
import type { DashboardProfileResponse } from '@/types/api/auth'
import type { FieldProp } from '@/types/components/form'
import type { EditProfileFormData } from '@/lib/schema'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'

import { buildEditProfileSchema } from '@/lib/schema'
import { toMediaValue } from '@/util/helpers'
import { ADMIN_AUTH_HEADERS } from '@/lib/dashboard-session'
import { queryKeys } from '@/util/queryKeysFactory'

export default function EditProfileForm({
  initialValues,
}: {
  initialValues: any
}) {
  const { t } = useTranslation()
  const [currentPhoneLimit, setCurrentPhoneLimit] = useState<number | null>(0)
  const [phoneStartingNumber, setPhoneStartingNumber] = useState<number | null>(
    0,
  )

  const fields: Array<FieldProp<EditProfileFormData>> = [
    {
      type: 'imgUploader',
      name: 'image',
      label: t('Form.labels.image'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        model: 'user',
        collection: 'avatar',
      },
    },
    {
      type: 'text',
      name: 'full_name',
      label: t('Form.labels.name'),
      placeholder: t('Form.labels.namePlaceholder'),
    },
    {
      type: 'email',
      name: 'email',
      label: t('Form.labels.email'),
      placeholder: t('Form.labels.emailPlaceholder'),
      inputProps: { readOnly: true },
    },

    {
      type: 'phone',
      name: 'phone',
      label: t('Form.labels.phone'),
      inputProps: {
        phoneCodeName: 'phone_code',
        phoneNumberName: 'phone',
        setCurrentPhoneLimit,
        setPhoneStartingNumber,
      },
      span: 2,
    },
  ]
  const profileMutation = useMutate<
    ApiResponseBase<DashboardProfileResponse>,
    { name: string; phone: string; phone_code: string }
  >({
    mutationKey: ['profile', 'update'],
    endpoint: 'profile',
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    invalidates: [queryKeys.auth.profile()],
    method: 'put',
  })
  const imageMutation = useMutate<
    ApiResponseBase<DashboardProfileResponse>,
    { image: string }
  >({
    mutationKey: ['profile', 'image'],
    endpoint: 'profile/image',
    general: true,
    authRequired: true,
    headers: ADMIN_AUTH_HEADERS,
    invalidates: [queryKeys.auth.profile()],
    method: 'put',
  })

  const handleSubmit = async (values: EditProfileFormData) => {
    await profileMutation.mutateAsync({
      name: values.full_name,
      phone: values.phone,
      phone_code: values.phone_code,
    })

    const mediaValue = values.image ? toMediaValue(values.image) : undefined
    if (
      mediaValue &&
      typeof mediaValue !== 'object' &&
      !String(mediaValue).startsWith('http') &&
      String(mediaValue) !== initialValues.image
    ) {
      await imageMutation.mutateAsync({ image: String(mediaValue) })
    }
  }

  return (
    <div>
      <AppForm<EditProfileFormData>
        schema={buildEditProfileSchema(
          t,
          currentPhoneLimit,
          phoneStartingNumber,
        )}
        fields={fields}
        defaultValues={initialValues}
        values={initialValues}
        onSubmit={handleSubmit}
        isLoading={profileMutation.isPending || imageMutation.isPending}
        gridColumns={2}
        spacing="md"
        className="bg-card border border-border rounded-lg shadow-sm"
        formClassName="p-6"
        submitButtonText={t('buttons.edit')}
        key={`form_${initialValues?.id ?? 'profile'}`}
      />
    </div>
  )
}
