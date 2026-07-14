import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { FieldProp } from '@/types/components/form'
import type { ProfileSettingsFormData } from '@/lib/schema'
import type { ApiResponse } from '@/types/api/http'
import type { DashboardUser } from '@/types/auth'
import AppForm from '@/components/common/form/AppForm'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { useMutate } from '@/hooks/UseMutate'
import { buildProfileSettingsSchema } from '@/lib/schema'
import { queryKeys } from '@/util/queryKeysFactory'

type ProfileSettingsPayload = {
  locale: 'ar' | 'en'
  allow_notifications: number
}

export default function ProfileSettings() {
  const { t, i18n } = useTranslation()
  const { data: user } = useDashboardProfile()
  const queryClient = useQueryClient()

  const fields: Array<FieldProp<ProfileSettingsFormData>> = [
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
        placeholder: t('Form.labels.language'),
        options: [
          { label: t('ar'), value: 'ar' },
          { label: t('en'), value: 'en' },
        ],
      },
      label: t('Form.labels.language'),
    },
  ]

  const { mutateAsync, isPending } = useMutate<
    ApiResponse,
    ProfileSettingsPayload
  >({
    mutationKey: ['profile', 'settings'],
    endpoint: 'profile/settings',
    method: 'patch',
  })

  const handleSubmit = async (values: ProfileSettingsFormData) => {
    await mutateAsync({
      locale: values.locale,
      allow_notifications: values.allow_notifications ? 1 : 0,
    })
    await i18n.changeLanguage(values.locale)
    document.documentElement.dir = values.locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = values.locale
    queryClient.setQueryData<DashboardUser>(
      queryKeys.auth.profile(),
      (current) =>
        current
          ? {
              ...current,
              settings: {
                ...current.settings,
                language: values.locale,
                allow_notifications: values.allow_notifications,
              },
            }
          : current,
    )
  }

  return (
    <AppForm<ProfileSettingsFormData>
      schema={buildProfileSettingsSchema(t)}
      fields={fields}
      defaultValues={{
        allow_notifications: user?.settings.allow_notifications,
        locale: user?.settings.language,
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
