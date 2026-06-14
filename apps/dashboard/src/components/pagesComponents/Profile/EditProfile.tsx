import { useTranslation } from 'react-i18next'
import AppForm from '@/components/common/form/AppForm'
import { FieldProp } from '@/types/components/form'
import { useMutate } from '@/hooks/UseMutate'
import { useAuthStore, UserAuth } from '@/stores/authStore'

import {
  buildEditProfileSchema,
  EditProfileFormData,
} from '@/lib/schema'
import { generateFinalOut } from '@/util/helpers'
import { useState } from 'react'

export default function EditProfileForm({
  initialValues,
}: {
  initialValues: any
}) {
  const { t } = useTranslation()
  const [currentPhoneLimit, setCurrentPhoneLimit] = useState<number | null>(0)
  const [phoneStartingNumber, setPhoneStartingNumber] = useState<number | null>(0)

  const fields: FieldProp<EditProfileFormData>[] = [
    {
      type: 'imgUploader',
      name: 'image',
      label: 'Profle Image',
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
    },

    {
      type: 'phone',
      name: 'phone',
      label: t('Form.labels.phone'),
      inputProps: {
        phoneCodeName: 'phone_code',
        phoneNumberName: 'phone',
        setCurrentPhoneLimit,
        setPhoneStartingNumber
      },
      span: 2,
    },
  ]
  const updateUser = useAuthStore((state) => state.updateUser)
  const { mutate, isPending } = useMutate<ApiResponseBase<UserAuth>>({
    mutationKey: ['profile'],
    endpoint: 'profile',
    onSuccess: (data) => {
      updateUser(data.data)
    },
    method: 'patch',
  })

  const handleSubmit = (values: EditProfileFormData) => {
    if (values?.image && typeof values.image === 'string' && values.image.startsWith('http')) {
      delete values.image
      delete initialValues.image
    }
    mutate(generateFinalOut(initialValues, values))
  }

  return (
    <div>
      <AppForm<EditProfileFormData>
        schema={buildEditProfileSchema(t, currentPhoneLimit, phoneStartingNumber) as any}
        fields={fields}
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isPending}
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
