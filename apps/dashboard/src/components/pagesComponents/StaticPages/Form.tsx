import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { useNavigate } from '@tanstack/react-router'
import { generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { staticPageFields } from './Config'
import { makePageSchema, StaticPageFormData } from '@/lib/schema'
import { useTranslation } from 'react-i18next'

function staticPagePayload(values: StaticPageFormData) {
  return {
    slug: values.slug,
    en: {
      title: values.title_en,
      content: values.content_en,
    },
    ar: {
      title: values.title_ar,
      content: values.content_ar,
    },
    ...(values.image ? { image: typeof values.image === 'object' ? (values.image as any)?.hash ?? (values.image as any)?.uid : values.image } : {}),
  }
}

export default function PageForm({ page }: { page?: any }) {

  const { mutate, isPending } = useMutate({
    endpoint: page?.id ? `static-pages/${page.id}` : 'static-pages',
    mutationKey: queryKeys.pages.getPage(),
    invalidates: [queryKeys.pages.all()],
    method: page?.id ? 'patch' : 'post',
    redirectTo: '/static-pages',
  })

  const handleSubmit = (values: StaticPageFormData) => {
    mutate(staticPagePayload(values))
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
