import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import {
  makePageAdditionalSchema,
  PageAdditionalForm,
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
      ? `static-pages/sections/${page.id}`
      : `static-pages/${spIdStr}/sections`,
    mutationKey: queryKeys.pages.getPage(spIdStr),
    invalidates: [queryKeys.pages.getPage(spIdStr)],
    method: page?.id ? 'patch' : 'post',
    onSuccess: () => onDone?.(),
  })

  const handleSubmit = (values: PageAdditionalForm) => {
    mutate({
      en: {
        title: values.title_en,
        content: values.content_en,
      },
      ar: {
        title: values.title_ar,
        content: values.content_ar,
      },
      sort_order: page?.sort_order ?? 0,
      is_active: page?.is_active ?? true,
      ...(values.image ? { image: typeof values.image === 'object' ? (values.image as any)?.hash ?? (values.image as any)?.uid : values.image } : {}),
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
        model: 'pagesection',
        collection: 'image',
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
