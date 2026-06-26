import { ColumnDef } from '@tanstack/react-table'
import { queryKeys } from '@/util/queryKeysFactory'
import { booleanControlColumn, createdAtColumn, imageColumn, textColumn, textDesc } from '@/components/features/sharedColumns'
import { FieldProp } from '@/types/components/form'
import { StaticPageFormData } from '@/lib/schema'
import { PickedAction } from '@/hooks/useStatusMutations'
import { RowAction } from '@/types/components/table'
import { TFn } from '@/lib/schema/validation'
import { StaticPage, AdditionalPage } from '@/types/api/staticPages'


export const STATIC_PAGE_TYPE_OPTIONS = [
  { label: 'staticPage.types.about_us', value: 'about-us' },
  { label: 'staticPage.types.privacy_policy', value: 'privacy-policy' },
  { label: 'staticPage.types.warranty_policy', value: 'warranty' },
  { label: 'staticPage.types.return_policy', value: 'returns' },
  { label: 'staticPage.types.shipping_policy', value: 'shipping-policy' },
  { label: 'staticPage.types.maintenance_guide', value: 'maintenance-guide' },
  { label: 'staticPage.types.repair_guide', value: 'repair-guide' },
  { label: 'staticPage.types.terms_of_use', value: 'terms-of-use' },
  { label: 'staticPage.types.cookies_policy', value: 'cookies-policy' },
  { label: 'staticPage.types.size_guide', value: 'size-guide' },
  { label: 'staticPage.types.payment', value: 'payment' },
  { label: 'staticPage.types.purchase_protection', value: 'purchase-protection' },
]

export const staticPagesColumns = (
  open: (type: PickedAction, id: StaticPage) => void,
  t: TFn,
): ColumnDef<StaticPage>[] =>
  [
    imageColumn<StaticPage>('image', 'table.columns.image'),
    textColumn<StaticPage>('title', 'table.columns.title'),
    textDesc<StaticPage>('content', 'table.columns.description'),
    textColumn<StaticPage>('slug', 'table.columns.slug', {
      render: (value) => t(`staticPage.types.${String(value.getValue()).replaceAll('-', '_')}`, { defaultValue: value.getValue() }),
    }),
    booleanControlColumn<StaticPage>(
      'is_active',
      'table.columns.status',
      open,
      'active',
      true,
      'static-pages',
    ),
    createdAtColumn<StaticPage>('table.createdAt'),
  ] as ColumnDef<StaticPage>[]
export const pageActions = (
  t: (key: string) => string,
  open: (type: 'active' | 'delete', row: StaticPage) => void,
) =>
  [
    {
      label: t('actions.edit'),
      to: '/static-pages/edit/$id',
      params: (row: StaticPage) => ({ id: String(row.id) }),
      queryKey: (id: string) => queryKeys.pages.getPage(id),
      permission: 'static-pages',
      action: 'update'
    },
    {
      label: t('actions.show'),
      to: '/static-pages/show/$id',
      params: (row: StaticPage) => ({ id: String(row.id) }),
      queryKey: (id: string) => queryKeys.pages.getPage(id),
      permission: 'static-pages',
      action: 'show'
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: StaticPage) => open('delete', row),
      permission: 'static-pages',
      action: 'destroy'
    },
    {
      label: (row: StaticPage) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: StaticPage) => open('active', row),
      permission: 'static-pages',
      action: 'update'
    },
  ] as RowAction<StaticPage>[]


export const AdditionalPagesActions = (
  t: (key: string) => string,
  open: (
    type: PickedAction | 'edit' | 'view' | 'create',
    row: AdditionalPage,
  ) => void,
) =>
  [
    {
      label: t('actions.edit'),
      onClick: (row: AdditionalPage) => open('edit', row),
      permission: 'static-pages',
      action: 'update'
    },
    {
      label: t('actions.show'),
      onClick: (row: AdditionalPage) => open('view', row),
      permission: 'static-pages',
      action: 'show'
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: AdditionalPage) => open('delete', row),
      permission: 'static-pages',
      action: 'destroy'
    },
    {
      label: (row: AdditionalPage) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: AdditionalPage) => open('active', row),
      permission: 'static-pages',
      action: 'update'
    },
  ] as RowAction<AdditionalPage>[]

export const staticPageFields = (t: any): FieldProp<StaticPageFormData>[] => [
  {
    type: 'imgUploader',
    name: 'image',
    label: t('Form.labels.image'),
    span: 2,
    inputProps: {
      maxFiles: 1,
      acceptedFileTypes: ['image/*'],
      model: 'staticpage',
      collection: 'image',
    },
  },
  {
    type: 'select',
    name: 'slug',
    label: t('Form.labels.pageType'),
    inputProps: {
      placeholder: t('Form.placeholders.pageType'),
      options: STATIC_PAGE_TYPE_OPTIONS.map((o) => ({
        label: t(o.label),
        value: o.value,
      })),
    },
    span: 1,
  },
  {
    type: 'text',
    name: 'title_ar',
    label: t('Form.labels.titleAr'),
    placeholder: t('Form.placeholders.titleAr'),
  },
  {
    type: 'text',
    name: 'title_en',
    label: t('Form.labels.titleEn'),
    placeholder: t('Form.placeholders.titleEn'),
  },
  {
    type: 'multiLangField',
    name: 'content' as any,
    label: t('Form.labels.content'),
    placeholder: t('Form.placeholders.content'),
    inputProps: {
      type: 'editor',
    },
    span: 2,
  },
]
