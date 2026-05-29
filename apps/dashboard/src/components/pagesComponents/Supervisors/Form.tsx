// src/features/users/supervisors/SupervisorForm.tsx
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { buildSupervisorFields } from './Config'
import { Supervisor } from '@/types/api/user'
import { SupervisorFormData, makeSupervisorSchema, updateSupervisorSchema } from '@/lib/schema'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { supervisorsQueryKeys } from '@/util/queryKeysFactory'
import { useMemo, useState } from 'react'

export default function SupervisorForm({ supervisor }: { supervisor?: Supervisor }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // const schema = supervisor ? updateSupervisorSchema(t) : makeSupervisorSchema(t)
  const [currentPhoneLimit, setCurrentPhoneLimit] = useState<number | null>(0)
  const [phoneStartingNumber, setPhoneStartingNumber] = useState<number | null>(0)
  const schema = useMemo(() =>
    supervisor
      ? updateSupervisorSchema(t, currentPhoneLimit, phoneStartingNumber)
      : makeSupervisorSchema(t, currentPhoneLimit, phoneStartingNumber), [currentPhoneLimit, phoneStartingNumber, t],
  )
  const fields = buildSupervisorFields(t, setCurrentPhoneLimit, setPhoneStartingNumber)
  const { mutate, isPending } = useMutate({
    endpoint: supervisor ? `supervisors/${supervisor?.id}` : 'supervisors',
    mutationKey: supervisorsQueryKeys.get(supervisor?.id?.toString() || 'new'),
    mutationOptions: { meta: { invalidates: [supervisorsQueryKeys.all()] } },
    method: supervisor?.id ? 'patch' : 'post',
    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      navigate({ to: '/supervisors' } as any)
    },
    onError: (_err, normalized) => {
      toast.error(normalized.message)
    },
  })

  const onSubmit = (values: SupervisorFormData) => {
    const { allow_notifications, language, ...rest } = values as any
    const out = generateFinalOut(supervisor, rest)
    // Send snake_case — backend interceptor converts to camelCase
    out.settings = {
      allow_notifications: allow_notifications ?? true,
      language: language ?? 'ar',
    }
    out.name = values.full_name
    delete out.full_name
    mutate(out)
  }

  return (
    <AppForm<SupervisorFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(supervisor),
        full_name: supervisor?.name,
        role_id: supervisor ? supervisor.role.id.toString() : undefined,
        allow_notifications: supervisor?.settings?.allow_notifications ?? true,
        language: supervisor?.settings?.language === 'en' ? 'en' : 'ar',
      }}
      onSubmit={onSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm min-w-5xl"
      formClassName="p-6"
      submitButtonText={
        supervisor
          ? t('actions.update', { entity: t('common.supervisor') })
          : t('actions.create', { entity: t('common.supervisor') })
      }
    />
  )
}
