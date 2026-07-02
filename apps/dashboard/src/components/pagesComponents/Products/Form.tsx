/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useTranslation } from 'react-i18next'
import * as React from 'react'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { Button } from '@ecommerce/ui/components/button'
import { buildProductFields } from './Config'
import type { ProductFormData } from '@/lib/schema';
import type { Product } from '@/types/api/product'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues, mapGalleryForForm, toMediaValue } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { makeProductSchema } from '@/lib/schema'

import Field from '@/components/common/form/Field'
import { zodFormResolver } from '@/lib/schema/resolver'

type ProductPayload = Record<string, unknown>

const removeEmptyPayloadValues = (payload: ProductPayload) => {
  Object.keys(payload).forEach((key) => {
    const value = payload[key]
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      delete payload[key]
    }
  })

  return payload
}

const buildProductPayload = (product: Product | undefined, values: ProductFormData) => {
  const finalOut = generateFinalOut(product, values)

  const payload: ProductPayload = {
    collection_id: finalOut.collection_id ? Number(finalOut.collection_id) : undefined,
    image: finalOut.image,
    gallery: finalOut.gallery?.map(toMediaValue) || [],
    tags: finalOut.tags ?? [],
    ar: finalOut.ar,
    en: finalOut.en,
  }

  if (!product) {
    payload.hasVariants = false
    payload.variants = [
      {
        price: Number(finalOut.price ?? 0),
        cost_price: finalOut.cost_price ?? null,
        discount_type: finalOut.discount_type ?? null,
        discount_value: finalOut.discount_value ?? null,
        stock_quantity: Number(finalOut.stock ?? 0),
        sku: finalOut.sku || '',
        barcode: finalOut.barcode || '',
        is_default: true,
        is_active: true,
        attributes: [],
        gallery: [],
      },
    ]
  } else {
    payload.price = finalOut.price !== undefined ? Number(finalOut.price) : undefined
    payload.stock = finalOut.stock !== undefined ? Number(finalOut.stock) : undefined
    payload.sku = finalOut.sku
    payload.barcode = finalOut.barcode
    payload.cost_price = finalOut.cost_price ?? null
    payload.discount_type = finalOut.discount_type ?? null
    payload.discount_value = finalOut.discount_value ?? null
    delete payload.gallery
    delete payload.image
  }

  return removeEmptyPayloadValues(payload)
}

export const TagsRepeater: React.FC<{ t: (k: string) => string }> = ({ t }) => {
  const { control } = useFormContext<any>()
  const { fields, append, remove } = useFieldArray({ control, name: 'tags' as const })

  const addRow = () => append('')

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{t('Form.labels.tags')}</h3>
        <Button type="button" variant="outline" onClick={addRow}>
          {t('actions.add')}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((f, idx) => (
        <div key={f.id} className="grid grid-cols-12 gap-3 items-end rounded-md border p-3">
          <div className="col-span-10">
            <Field
              type="text"
              name={`tags.${idx}` as const}
              control={control}
              label={`${t('Form.labels.tag')} #${idx + 1}`}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <button
              type="button"
              className="text-destructive text-sm"
              onClick={() => remove(idx)}
            >
              {t('actions.delete')}
            </button>
          </div>
        </div>
      ))}

        {fields.length === 0 && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            {t('Form.messages.noTags')}
          </div>
        )}
      </div>
    </div>
  )
}

const FormSectionHeader = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="col-span-2 rounded-lg border bg-muted/30 p-4">
    <h3 className="text-sm font-semibold">{title}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
  </div>
)

export default function ProductForm({ product }: { product?: Product }) {
  const { t } = useTranslation()
  const productQueryKey = queryKeys.products.getProduct(String(product?.id ?? 'new'))
  
  const form = useForm<ProductFormData>({
    resolver: zodFormResolver(makeProductSchema(t)),
    defaultValues: {
      ...generateInitialValues(product),
      collection_id: product?.collection?.id?.toString() ?? '',
      gallery: mapGalleryForForm(product?.gallery),
      tags: product ? product?.tags : [],
      cost_price: product?.cost_price ?? null,
      discount_type: product?.discount_type ?? null,
      discount_value: product?.discount_value ?? null,
    },
      mode: 'onChange',
    })
  const baseFields = buildProductFields(t, form as any, product?.id ? String(product.id) : undefined)

  const fields = React.useMemo(
    () => [
      {
        type: 'custom' as const,
        name: 'identitySection',
        span: 2,
        customItem: (
          <FormSectionHeader
            title={t('productForm.sections.identity', 'Product identity')}
            description={t(
              'productForm.sections.identityHelp',
              'Catalog information shared by every sellable variant.',
            )}
          />
        ),
      },
      ...baseFields.filter((field) =>
        ['collection_id', 'name', 'description'].includes(String(field.name)),
      ),
      { type: 'custom' as const, name: 'tags',  span: 2, customItem: <TagsRepeater t={t} /> },
      {
        type: 'custom' as const,
        name: 'mediaSection',
        span: 2,
        customItem: (
          <FormSectionHeader
            title={t('productForm.sections.media', 'Product media')}
            description={t('productForm.sections.mediaHelp', 'Images shown before a specific variant is selected.')}
          />
        ),
      },
      ...baseFields.filter((field) => ['image', 'gallery'].includes(String(field.name))),
      {
        type: 'custom' as const,
        name: 'offerSection',
        span: 2,
        customItem: (
          <FormSectionHeader
            title={t('productForm.sections.offer', 'Fallback product offer')}
            description={t(
              'productForm.sections.offerHelp',
              'This offer is inherited only by variants that do not have their own offer.',
            )}
          />
        ),
      },
      ...baseFields.filter((field) => ['discount_type', 'discount_value'].includes(String(field.name))),
      {
        type: 'custom' as const,
        name: 'defaultVariantSection',
        span: 2,
        customItem: (
          <FormSectionHeader
            title={t('productForm.sections.defaultVariant', 'Default sellable variant')}
            description={
              product
                ? t(
                    'productForm.sections.defaultVariantEditHelp',
                    'For multi-variant products, manage price, stock, SKU, barcode, and default status in the variants section on the product page.',
                  )
                : t(
                    'productForm.sections.defaultVariantHelp',
                    'A simple product is created with one default variant. This variant is the quick-add and checkout stock unit.',
                  )
            }
          />
        ),
      },
      ...(product?.has_variants
        ? []
        : baseFields.filter((field) => ['price', 'cost_price', 'stock', 'sku', 'barcode'].includes(String(field.name)))),
    ],
    [baseFields, product, t]
  )

  const { mutate, isPending } = useMutate({
    endpoint: product ? `products/${product.id}` : 'products',
    mutationKey: productQueryKey,
    invalidates: [queryKeys.products.all(), productQueryKey],
    method: product?.id ? 'patch' : 'post',
    redirectTo: '/products',
  })

  const handleSubmit = (values: ProductFormData) => {
    mutate(buildProductPayload(product, values))
  }

  return (
    <AppForm<ProductFormData>
      schema={makeProductSchema(t)}
      fields={fields as any}
      providedForm={form as any}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        product
          ? t('actions.update', { entity: t('common.product') })
          : t('actions.create', { entity: t('common.product') })
      }
    />
  )
}
