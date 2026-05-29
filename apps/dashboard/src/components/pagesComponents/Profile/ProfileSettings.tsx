import z from 'zod/v4'
import { useTranslation } from 'react-i18next'
import AppForm from '@/components/common/form/AppForm'
import { FieldProp } from '@/types/components/form'
import { useMutate } from '@/hooks/UseMutate'
import { ApiResponse } from '@/types/api/http'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import {
  buildProfileSettingsSchema,
  ProfileSettingsFormData ,
} from '@/lib/schema'



export default function ProfileSettings() {
  const { t, i18n } = useTranslation()
    const settings = useAuthStore((state) => state.user?.settings)
    const updateUser = useAuthStore((state) => state.updateUser)

    const fields: FieldProp<ProfileSettingsFormData>[] = [
      {
        type: 'checkbox',
        name: 'allow_notifications',
        label: t('Form.labels.allow_notifications'),
        span: 2,
      },
      {
        type: 'select',
        name: 'locale',
        inputProps: {
          placeholder: 'prefered language',
          options: [
            { label: 'Arabic', value: 'ar' },
            { label: 'English', value: 'en' },
          ],
        },
        label: t('Form.labels.language'),
        placeholder: t('Form.labels.newPasswordPlaceholder'),
      },
    ]
  

  const { mutateAsync, isPending } = useMutate<ApiResponse, any>({
    mutationKey: ['rofile/settings'],
    endpoint: 'profile/settings',
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (_err, normalized) => {
      toast.error(normalized.message)
    },
    method: 'patch',
  })

  const handleSubmit = async (values: ProfileSettingsFormData) => {
    await mutateAsync({ ...values, allow_notifications: values.allow_notifications ? 1 : 0 })
    i18n.changeLanguage(values.locale)
    document.documentElement.dir = values.locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = values.locale
    updateUser({
      settings: {
        language: values.locale,
        allow_notifications: values.allow_notifications ? 1 : 0,
        // _method: 'patch',
      },
    })
  }

  return (
    <AppForm<ProfileSettingsFormData>
      schema={buildProfileSettingsSchema(t)}
      fields={fields}
      defaultValues={{
        allow_notifications: settings?.allow_notifications,
        locale: settings?.language,
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={t('buttons.edit')}
    />
  )
}
