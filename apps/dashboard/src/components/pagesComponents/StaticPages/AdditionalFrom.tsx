import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { pagesQueryKeys } from '@/util/queryKeysFactory'
import {
  makePageAdditionalSchema,
  makePageSchema,
  PageAdditionalForm,
  StaticPageFormData,
} from '@/lib/schema'
import { useTranslation } from 'react-i18next'

export default function PageAdditonalForm({
  page,
  static_page_id,
  onDone, // <-- NEW
}: {
  page?: any
  static_page_id: string | number
  onDone?: () => void
}) {
  const spIdStr = String(static_page_id)
  const { t } = useTranslation()

  const { mutate, isPending } = useMutate({
    endpoint: page?.id
      ? `static-page-additionals/${page.id}`
      : 'static-page-additionals',
    mutationKey: pagesQueryKeys.getPage(spIdStr),
    mutationOptions: {
      meta: { invalidates: [pagesQueryKeys.getPage(spIdStr)] },
    },
    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      onDone?.() 
    },
    onError: (_err, normalized) => {
      toast.error(normalized.message)
    },
    method: 'post',
    formData: true,
  })

  const handleSubmit = (values: PageAdditionalForm) => {
    mutate({
      ...generateFinalOut(page, values),
      static_page_id: spIdStr,
      _method: page?.id ? 'patch' : 'post',
    })
  }

  const schema = makePageAdditionalSchema(t)

  const fields = [
    {
      type: 'imgUploader',
      name: 'image',
      label: t('Form.labels.image'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        apiEndpoint: '/media/upload',
        model: 'image',
        baseUrl: import.meta.env.VITE_BASE_URL_API,
      },
    },
    {
      type: 'multiLangField',
      name: 'title',
      label: t('Form.labels.title'),
      placeholder: t('Form.placeholders.title'),
      span: 2,
    },
    {
      type: 'multiLangField',
      name: 'content' as any,
      label: t('Form.labels.content'),
      placeholder: t('Form.placeholders.content'),
      inputProps: { type: 'editor' },
      span: 2,
    },
  ] as const

  return (
    <AppForm<PageAdditionalForm>
      schema={schema as any}
      fields={fields as any}
      defaultValues={{ ...generateInitialValues(page) }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="w-full"
      formClassName="p-0 pt-4"
      submitButtonText={
        page?.id
          ? t('actions.update', {
              entity: t('pageShow.additionals.item', { defaultValue: 'Item' }),
            })
          : t('actions.create', {
              entity: t('pageShow.additionals.item', { defaultValue: 'Item' }),
            })
      }
    />
  )
}
