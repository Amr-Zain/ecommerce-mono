import z from 'zod/v4'
import { Control } from 'react-hook-form'
import AppForm from '@/components/common/form/AppForm'
import { FieldProp } from '@/types/components/form'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { pagesQueryKeys } from '@/util/queryKeysFactory'
import { staticPageFields } from './Config'
import { makePageSchema, StaticPageFormData } from '@/lib/schema'
import { useTranslation } from 'react-i18next'



export default function PageForm({ page }: { page?: any }) {
  const navigate = useNavigate()

  const { mutate, isPending } = useMutate({
    endpoint: page?.id ? `static-pages/${page.id}` : 'static-pages',
    mutationKey: pagesQueryKeys.getPage(),
    mutationOptions: { meta: { invalidates: [pagesQueryKeys.all()] } },
    method: page?.id ? 'patch' : 'post',
    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      navigate({ to: '/static-pages' })
    },
    onError: (_err, normalized) => {
      toast.error(normalized.message)
    },
  })

  const handleSubmit = (values: StaticPageFormData) => {
    mutate(generateFinalOut(page, values))
  }
  const {t} = useTranslation();
  const schema = makePageSchema(t);
  const fields = staticPageFields(t)
  return (
    <AppForm<StaticPageFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(page),
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        page?.id
          ? t('actions.update', { entity: t('common.page') })
          : t('actions.create', { entity: t('common.page') })
      }
    />
  )
}
