import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues, mapGalleryForForm, toMediaValue } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { productsQueryKeys } from '@/util/queryKeysFactory'
import { makeProductSchema, ProductFormData } from '@/lib/schema'
import { Product } from '@/types/api/product'
import { buildProductFields } from './Config'

import * as React from 'react'
import { useFormContext, useFieldArray, useForm } from 'react-hook-form'
import Field from '@/components/common/form/Field'
import { Button } from '@ecommerce/ui/components/button'
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


export default function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const productQueryKey = productsQueryKeys.getProduct(String(product?.id ?? 'new'))
  
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
      ...baseFields,
      { type: 'custom' as const, name: 'tags',  span: 2, customItem: <TagsRepeater t={t} /> },
    ],
    [baseFields, t]
  )

  const { mutate, isPending } = useMutate({
    endpoint: product ? `products/${product.id}` : 'products',
    mutationKey: productQueryKey,
    mutationOptions: {
      meta: {
        invalidates: [
          productsQueryKeys.all(),
          productQueryKey,
        ],
      },
    },
    method: product?.id ? 'patch' : 'post',
    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      navigate({ to: '/products' } as any)
    },
    onError: (_e, normalized) => toast.error(normalized.message),
  })

  const handleSubmit = (values: ProductFormData) => {
    mutate(buildProductPayload(product, values))
  }

  return (
    <AppForm<ProductFormData>
      schema={makeProductSchema(t) as any}
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
