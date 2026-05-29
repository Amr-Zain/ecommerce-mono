import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  DateColumn,
  imageColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { categoriesQueryKeys, productsQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import { ProductFormData } from '@/lib/schema'
import { Product, ProductVariation } from '@/types/api/product'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import { Popover, PopoverContent } from '@ecommerce/ui/components/popover'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import { FormLabel } from '@ecommerce/ui/components/form'
import { NestedSelect } from '@ecommerce/ui/components/nested-select'

export const productColumns = (
  open: (type: PickedAction, row: Product) => void,
): ColumnDef<Product>[] => [
    imageColumn<Product>('image', 'table.columns.image'),
    textColumn<Product>('name', 'table.columns.name', { className: 'min-w-15 ' }),
    // textColumn<Product>('description', 'table.columns.description', {
    //   className: 'min-w-20 ',
    //   render: (value) => (
    //     <Popover>
    //         <PopoverTrigger  className='cursor-pointer'>
    //           <div
    //             className={cn('text-muted-foreground line-clamp-1')}
    //           dangerouslySetInnerHTML={{ __html: String(value.getValue() ?? '-') }}
    //           />
    //         </PopoverTrigger>
    //         <PopoverContent className="data-[state=open]:!zoom-in-0 data-[state=closed]:!zoom-out-0 origin-center duration-400 max-h-[50vh] overflow-y-auto">
    //             <div
    //               dangerouslySetInnerHTML={{ __html: value.getValue() }}
    //             />
    //         </PopoverContent>
    //       </Popover>

    //   ),
    // }),
    textColumn<Product>('collection', 'table.columns.category', {
      render: (value) => (
        <div className="text-muted-foreground line-clamp-1">
          {value.getValue()?.name}
        </div>
      ),
    }),

    /* textColumn<Product>(
      (row) =>
        row.discount
          ? `${row.price} (-${row.discount.type === 'percent' ? row.discount.value + '%' : row.discount.amount})`
          : String(row.price),
      'table.columns.price',
    ), */
    textColumn<Product>('sku', 'table.columns.sku', {
      className: 'text-nowrap',
      render: (ctx) => (
        <div className='flex gap-2 justify-between  items-center'>
          <div className=' w-16 truncate line-clamp-1 '>{ctx.getValue()}{' '}</div>
          <ButtonCopy content={ctx.getValue()} />
        </div>
      ),
    }),
    textColumn<Product>('barcode', 'table.columns.barcode', {
      className: 'text-nowrap',
      render: (ctx) => (
        <div className='flex gap-2 justify-between items-center'>
          <div className=' w-16 truncate line-clamp-1 '>{ctx.getValue()}{' '}</div>
          <ButtonCopy content={ctx.getValue()} />
        </div>
      ),
    }),
    textColumn<Product>('price', 'table.columns.price', { sortable: true }),
    /* textColumn<Product>('discount', 'table.columns.discount', {
      render: (value) => {
        const row = value.row.original
        if (row.discount) {
          return (
            <div className="text-muted-foreground">
              {row.discount.type === 'percentage'
                ? `${row.discount.value}%`
                : `$${row.discount.amount}`}
            </div>
          )
        }
      },
    }), */
    textColumn<Product>('stock', 'table.columns.stock', { sortable: true }),
    /*   textColumn<Product>('sold', 'table.columns.sold', { sortable: true }),
    textColumn<Product>('reserved', 'table.columns.reserved', { sortable: true }),
    textColumn<Product>('average_rate', 'table.columns.average_rate', {
      sortable: true,
    }), */
    // textColumn<Product>('total_reviews', 'table.columns.total_reviews', {
    //   sortable: true,
    // }),
    booleanControlColumn<Product>(
      'is_active',
      'table.status',
      open,
      'active',
      true,
      'can-not-change-status',
    ),
    DateColumn<Product>('created_at', 'table.createdAt'),
  ]

export const productActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Product) => void,
): RowAction<Product>[] => [
    {
      label: t('actions.show'),
      to: '/products/show/$id',
      params: (row: Product) => ({ id: String(row.id) }),
      permission: 'products',
      action: 'show',
      queryKey: (id: string) => productsQueryKeys.getProduct(id),
    },
    {
      label: t('actions.edit'),
      to: '/products/edit/$id',
      params: (row: Product) => ({ id: String(row.id) }),
      permission: 'products',
      action: 'update',
      queryKey: (id: string) => productsQueryKeys.getProduct(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: Product) => open('delete', row),
      permission: 'products',
      action: 'destroy',
    },
    {
      label: (row: Product) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: Product) => open('active', row),
      permission: 'products',
      action: 'update',
    },
  ]

export const getProductFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[is_active]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'filters[collection_id]',
    title: t('table.columns.category'),
    endpoint: 'collections',
    select: (res: any) =>
      (res.data || []).map((c: any) => ({ label: c.name, value: c.id })),
    multiple: false,
    hasSearch: true,
  },
  {
    id: 'sort[created_at]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]

export const buildProductFields = (
  t: (key: string) => string,
  form: ReturnType<typeof import("react-hook-form").useForm<ProductFormData>>,
  modelId?: string,
): FieldProp<ProductFormData>[] => {
  const collection_id = form.watch('collection_id');
  return [
    {
      type: 'imgUploader',
      name: 'image',
      label: t('Form.labels.image'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['image/*'],
        model: 'product',
        collection: 'image',
        modelId,
      },
    },
    {
      type: 'imgUploader',
      name: 'gallery',
      label: t('Form.labels.gallery'),
      span: 2,
      inputProps: {
        maxFiles: 10,
        multiple: true,
        acceptedFileTypes: ['image/*'],
        model: 'product',
        collection: 'gallery',
        modelId,
      },
    },
    /* {
      type: 'select',
      name: 'category_id',
      label: t('Form.labels.category'),
      inputProps: {
        placeholder: t('Form.placeholders.category'),
        endpoint: 'collections?custom_filter=sub_sub_collection',
        queryKey: categoriesQueryKeys.filterdNotPage({
          custom_filter: 'sub_sub_collection',
        }),
        select: (res: any) =>
          (res.data || []).map((c: any) => ({
            label: c.name,
            value: String(c.id),
          })),
      },
    }, */
    {
      type: 'custom' as const, label: t('Form.labels.parentCategory'),
      name: 'collection_id',
      customItem:
        <>
          <FormLabel>{t('Form.labels.category')}</FormLabel>
          <NestedSelect placeholder={t('Form.placeholders.category')} onSelect={(item) => form.setValue('collection_id', item.id.toString())} value={collection_id?.toString()!} />
        </>
    },
    {
      type: 'number',
      name: 'price',
      label: t('Form.labels.price'),
    },
    {
      type: 'number',
      name: 'cost_price',
      label: t('Form.labels.costPrice'),
    },
    {
      type: 'select',
      name: 'discount_type',
      label: t('Form.labels.discountType'),
      inputProps: {
        placeholder: t('Form.placeholders.discountType'),
        options: [
          { label: t('Form.options.fixed'), value: 'FIXED' },
          { label: t('Form.options.percent'), value: 'PERCENTAGE' },
        ],
      },
    },
    {
      type: 'number',
      name: 'discount_value',
      label: t('Form.labels.discountValue'),
    },
    {
      type: 'number',
      name: 'stock',
      label: t('Form.labels.stock'),
    },
    {
      type: 'text',
      name: 'barcode',
      label: t('table.columns.barcode'),
    },
    {
      type: 'text',
      name: 'sku',
      label: t('Form.labels.sku'),
    },
    {
      type: 'multiLangField',
      name: 'name' as any,
      label: t('Form.labels.name'),
      span: 2,
    },
    {
      type: 'multiLangField',
      name: 'description' as any,
      label: t('Form.labels.description'),
      inputProps: {
        type: 'editor',
      },
      span: 2,
    },
  ] as FieldProp<ProductFormData>[]
}

export type ProductVariationFormData = {
  product_id: number | string
  price?: number
  cost_price?: number | null
  discount_type?: 'FIXED' | 'PERCENTAGE' | null
  discount_value?: number | null
  stock?: number
  sku: string
  barcode: string
  is_active?: boolean
  gallery?: { attach_hash: string; hash: string, id: string, mime_type: string, path: string, size: string, url: string }[]
  // real array:
  variation_attributes: Array<{ attribute_id?: string; value_id?: string }>
}

export const buildVariationFields = (
  t: (key: string) => string,
  modelId?: string,
): FieldProp<ProductVariationFormData>[] => [
    {
      type: 'imgUploader',
      name: 'gallery',
      label: t('Form.labels.gallery'),
      span: 2,
      inputProps: {
        maxFiles: 10,
        multiple: true,
        acceptedFileTypes: ['image/*'],
        model: 'productvariant',
        collection: 'gallery',
        modelId,
      },
    },
    {
      type: 'number',
      name: 'price',
      label: t('Form.labels.price'),
      placeholder: t('Form.placeholders.price'),
    },
    {
      type: 'number',
      name: 'cost_price',
      label: t('Form.labels.costPrice'),
      placeholder: t('Form.placeholders.costPrice'),
    },
    {
      type: 'select',
      name: 'discount_type',
      label: t('Form.labels.discountType'),
      placeholder: t('Form.placeholders.discountType'),
      inputProps: {
        options: [
          { label: t('Form.options.fixed'), value: 'FIXED' },
          { label: t('Form.options.percent'), value: 'PERCENTAGE' },
        ],
      } as any,
    },
    {
      type: 'number',
      name: 'discount_value',
      label: t('Form.labels.discountValue'),
      placeholder: t('Form.placeholders.discountValue'),
    },
    {
      type: 'number',
      name: 'stock',
      label: t('Form.labels.stock'),
      placeholder: t('Form.placeholders.stock'),
    },
    {
      type: 'text',
      name: 'barcode',
      label: t('table.columns.barcode'),
      placeholder: t('Form.placeholders.barcode'),
    },
    {
      type: 'text',
      name: 'sku',
      label: t('Form.labels.sku'),
      placeholder: t('Form.placeholders.sku'),
    },
    {
      type: 'select',
      name: 'is_active',
      label: t('status.title'),
      placeholder: t('Form.placeholders.status'),
      inputProps: {
        options: [
          { label: t('status.active'), value: true },
          { label: t('status.inactive'), value: false },
        ],
      } as any,
    },
  ]
export const ProductVariationActions = (
  t: (key: string) => string,
  open: (
    type: 'edit' | 'view' | 'delete' | 'active',
    row: ProductVariation,
  ) => void,
) => [
  {
    label: t('actions.edit'),
    onClick: (row: ProductVariation) => open('edit', row),
    permission: 'product-variations',
    action: 'update',
  },
  {
    label: t('actions.show'),
    onClick: (row: ProductVariation) => open('view', row),
    permission: 'product-variations',
    action: 'show',
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: ProductVariation) => open('delete', row),
    permission: 'product-variations',
    action: 'destroy',
  },
  {
    label: (row: ProductVariation) =>
      t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
    onClick: (row: ProductVariation) => open('active', row),
    permission: 'product-variations',
    action: 'update',
  },
] as RowAction<ProductVariation>[]
