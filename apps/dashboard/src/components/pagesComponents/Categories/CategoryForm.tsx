import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/util/queryKeysFactory'
import { CategoryFormData, makeCategorySchema } from '@/lib/schema'
import { buildCategoryFields } from './Config'
import { useForm } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
export type CategoryEntity = {
  id: number
  slug: string
  name: string
  description?: string
  image?: string | null
  sort_order?: number
  is_active?: boolean
  parent?: { id: string; name: string; image?: string | null } | null
  translations?: {
    en?: { name?: string; description?: string }
    ar?: { name?: string; description?: string }
  }
}

export default function CategoryForm({
  category,
}: {
  category?: CategoryEntity
}) {
  const { t } = useTranslation()
  const schema = makeCategorySchema(t)

  const form = useForm<CategoryFormData>({
    resolver: zodFormResolver(schema),
    defaultValues: {
      ...generateInitialValues(category),
      slug: category?.slug || '',
      parent_id: category?.parent?.id || '',
      sort_order: category?.sort_order?.toString(),
    },
    mode: 'onChange',
  })
  const fields = [
    ...buildCategoryFields(t, form as any),
  ]

  const { mutate, isPending } = useMutate({
    endpoint: category ? `collections/${category.id}` : 'collections',
    mutationKey: queryKeys.categories.getCategory(String(category?.id ?? 'new')),
    invalidates: [
      queryKeys.categories.all(),
      queryKeys.categories.getCategory(String(category?.id ?? 'new')),
    ],
    method: category?.id ? 'patch' : 'post',
    redirectTo: '/categories',
  })

  const handleSubmit = (values: CategoryFormData) => {
    if (!values.parent_id) {
      delete values.parent_id
    }
    mutate({
      ...generateFinalOut(category, values),
    })
  }

  return (
    <AppForm<CategoryFormData>
      schema={schema as any}
      fields={fields}
      providedForm={form as any}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        category
          ? t('actions.update', { entity: t('common.category') })
          : t('actions.create', { entity: t('common.category') })
      }
    />
  )
}
