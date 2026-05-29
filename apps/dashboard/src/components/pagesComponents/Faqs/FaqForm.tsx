// src/components/pagesComponents/Settings/Faqs/Form.tsx
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { faqQueryKeys } from '@/util/queryKeysFactory'
import { FaqFormData, makeFaqSchema } from '@/lib/schema'
import { buildFaqFields } from './Config'
import { FAQ_TYPE_OPTIONS } from '@/types/api/faq'

type FaqShow = {
  id: number
  type: string 
  question: string
  answer: string
  is_active: boolean
  translations?: {
    en?: { question?: string; answer?: string }
    ar?: { question?: string; answer?: string }
  }
}

export default function FaqForm({ faq }: { faq?: FaqShow }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const schema = makeFaqSchema(t)
  const fields = buildFaqFields(t)

  const { mutate, isPending } = useMutate({
    endpoint: faq ? `faqs/${faq.id}` : 'faqs',
    mutationKey: faqQueryKeys.getFaq(String(faq?.id ?? 'new')),
    method: faq?.id ? 'patch' : 'post',
    mutationOptions: { meta: { invalidates: [faqQueryKeys.all()] } },

    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      navigate({ to: '/faqs' } as any)
    },
    onError: (_e, normalized) => toast.error(normalized.message),
  })
  const handleSubmit = (values: FaqFormData) => {
    mutate(generateFinalOut(faq, values))
  }

  return (
    <AppForm<FaqFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={{ ...generateInitialValues(faq) }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        faq
          ? t('actions.update', { entity: t('common.faq') })
          : t('actions.create', { entity: t('common.faq') })
      }
    />
  )
}
