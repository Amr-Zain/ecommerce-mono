import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  DateColumn,
  imageColumn,
  imageNameColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import { CategoryFormData } from '@/lib/schema'
import { Category } from '@/types/api/faq'
import TabsBadgeCategories from './Tabs'
import { NestedCategorySelect } from '@/components/pagesComponents/Products/NestedCategorySelect'
import { FormLabel } from '@ecommerce/ui/components/form'
export const categoryColumns = (
  open: (type: PickedAction, row: Category) => void,
): ColumnDef<Category>[] => [
  imageColumn<Category>('image', 'table.columns.image'),
  textColumn<Category>('name', 'table.columns.name'),
  textColumn<Category>('description', 'table.columns.description', {
    render: (value) => (
      <div
        className="text-muted-foreground line-clamp-1"
        dangerouslySetInnerHTML={{ __html: value.getValue() }}
      />
    ),
  }),
  imageNameColumn<Category>(
    (row) =>
      row.parent ? { image: row.parent.image, name: row.parent.name } : null,
    'table.columns.parentCategory',
    { placeholder: '-' }, // optional
  ),
  booleanControlColumn<Category>(
    'is_active',
    'table.status',
    open,
    'active',
    false,
    'categories',
  ),
  DateColumn<Category>('created_at', 'table.createdAt'),
]

export const categoryActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Category) => void,
) =>
  [
    {
      label: t('actions.show'),
      to: '/categories/show/$id',
      params: (row: Category) => ({ id: String(row.id) }),
      permission: 'collections',
      action: 'show',
      queryKey: (id: string) => categoriesQueryKeys.getCategory(id),
    },
    {
      label: t('actions.editCategory'),
      to: '/categories/edit/$id',
      params: (row: Category) => ({ id: String(row.id) }),
      permission: 'collections',
      action: 'update',
      //disabled: hasPermission('categories.edit'),
      queryKey: (id: string) => categoriesQueryKeys.getCategory(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: Category) => open('delete', row),
      permission: 'collections',
      action: 'delete',
    },
    {
      label: (row: Category) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: Category) => open('active', row),
      permission: 'collections',
      action: 'update',
    },
  ] as RowAction<Category>[]

export const getCategoryFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[is_active]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  /* {
    id: 'filters[parent_id]',
    title: t('table.columns.parentCategory'),
    endpoint: 'collections',
    select: (data) =>
      (data.data as unknown as Category[]).map((c) => ({
        label: c.name,
        value: c.id,
      })),
    multiple: false,
  }, */

  {
    id: 'sort[created_at]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
  {
    type: 'custom',
    id: 'ff',
    jsx: <TabsBadgeCategories />,
  },
]

export function buildCategoryFields(
  t: (k: string) => string,
  form: ReturnType<typeof import('react-hook-form').useForm<CategoryFormData>>,
): FieldProp<CategoryFormData>[] {
  const currentParentId = form.watch('parent_id')
  return [
    {
      type: 'text',
      name: 'slug',
      label: 'Slug',
      placeholder: 'watches',
      span: 2,
    },
    {
      type: 'imgUploader',
      name: 'image',
      label: t('Form.labels.image'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        apiEndpoint: '/media/upload',
        model: 'collection',
        baseUrl: import.meta.env.VITE_BASE_URL_API,
      },
    },
    {
      type: 'number',
      name: 'sort_order',
      label: t('Form.labels.sortOrder'),
      placeholder: '1',
    },
    /*  {
       type: 'select',
       name: 'parent_id',
       label: t('Form.labels.parentCategory'),
       inputProps: {
         endpoint: 'collections',
         select: (data: any) =>
           (data.data as any[]).map((c) => ({
             label: c.name,
             value: String(c.id),
           })),
         clearable: true,
         placeholder: t('Form.placeholders.parentCategory'),
       },
     }, */
    {
      type: 'custom' as const,
      label: t('Form.labels.parentCategory'),
      name: 'parent_id',
      customItem: (
        <>
          <FormLabel>{t('Form.labels.parentCategory')}</FormLabel>
          <NestedCategorySelect
            placeholder={t('Form.placeholders.parentCategory')}
            onSelect={(item) => form.setValue('parent_id', item.id.toString())}
            value={currentParentId?.toString()!}
          />
        </>
      ),
    },
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      placeholder: t('Form.placeholders.name'),
      span: 2,
    },
    {
      type: 'multiLangField',
      name: 'description' as any,
      inputProps: {
        type: 'editor',
      },
      label: t('Form.labels.description'),
      placeholder: t('Form.placeholders.description'),
      span: 2,
    },
  ]
}
