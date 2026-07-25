/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ecommerce/ui/components/dialog'
import * as React from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { z } from 'zod/v4'
import { Button } from '@ecommerce/ui/components/button'
import { buildVariationFields } from './Config'
import type { ProductVariationFormData } from './Config';
import type { ProductVariation } from '@/types/api/product'
import AppForm from '@/components/common/form/AppForm'
import Field from '@/components/common/form/Field'
import { queryKeys } from '@/util/queryKeysFactory'
import { generateFinalOut } from '@/util/helpers'
import { useMutate } from '@/hooks/UseMutate'
import SkuCodeGenerator from './SkuCodeGenerator'

type VariationGalleryItem = {
  attach_hash?: string
  hash?: string
  id: string | number
  mime_type?: string
  path?: string
}
type ProductVariationWithGallery = ProductVariation & {
  gallery?: Array<VariationGalleryItem> | null
}
type VariationAttributeFormValue = {
  attribute_id?: string
  value_id?: string
}
type VariationSubmitValue = ProductVariationFormData & {
  gallery?: Array<string | VariationGalleryItem>
  variation_attributes?: Array<VariationAttributeFormValue>
}

const toSelectOptions = (res: any) =>
  (res.data || []).map((item: { id: string | number; name: string }) => ({
    label: item.name,
    value: String(item.id),
  }))

const mapVariationAttributes = (variation?: ProductVariationWithGallery) =>
  variation?.attributes?.map((attribute) => ({
    attribute_id: String(attribute.attribute_id),
    value_id: String(attribute.value_id),
  })) ?? []

const mapVariationGallery = (variation?: ProductVariationWithGallery) =>
  variation?.gallery?.map((img) => ({
    attach_hash: img.attach_hash,
    url: img.path,
    uid: img.id,
    type: img.mime_type,
  })) ?? []

const getVariationBaseValues = (
  variation?: ProductVariationWithGallery,
): Record<string, unknown> => ({
  price: variation?.price,
  cost_price: variation?.cost_price,
  discount_type: variation?.discount_type,
  discount_value: variation?.discount_value,
  stock: variation?.stock_quantity,
  sku: variation?.sku,
  barcode: variation?.barcode,
  is_active: variation?.is_active,
  is_default: variation?.is_default,
  gallery: variation?.gallery || [],
  variation_attributes: mapVariationAttributes(variation),
})

const getVariationDefaultValues = (
  productId: number | string,
  variation?: ProductVariationWithGallery,
): ProductVariationFormData => {
  const attributes = mapVariationAttributes(variation)

  return {
    product_id: productId,
    price: variation?.price ?? undefined,
    cost_price: variation?.cost_price ?? null,
    discount_type: variation?.discount_type ?? null,
    discount_value: variation?.discount_value ?? null,
    stock: variation?.stock_quantity ?? undefined,
    sku: variation?.sku ?? '',
    barcode: variation?.barcode ?? '',
    is_active: variation?.is_active ?? true,
    is_default: variation?.is_default ?? false,
    gallery: mapVariationGallery(variation) as unknown as ProductVariationFormData['gallery'],
    variation_attributes: attributes.length
      ? attributes
      : [{ attribute_id: '', value_id: '' }],
  }
}

const toGalleryValue = (img: string | VariationGalleryItem) =>
  typeof img === 'object' ? img.attach_hash ?? img.hash ?? img.id : img

const buildVariationPayload = (
  variation: ProductVariationWithGallery | undefined,
  values: ProductVariationFormData,
) => {
  const finalOut = generateFinalOut(getVariationBaseValues(variation), values) as VariationSubmitValue

  return {
    price: finalOut.price,
    cost_price: finalOut.cost_price ?? null,
    discount_type: finalOut.discount_type ?? null,
    discount_value: finalOut.discount_value ?? null,
    stock_quantity: finalOut.stock,
    is_active: finalOut.is_active,
    is_default: finalOut.is_default,
    gallery: finalOut.gallery?.map(toGalleryValue) || [],
    sku: finalOut.sku,
    barcode: finalOut.barcode,
    attributes:
      finalOut.variation_attributes?.map((attribute) => ({
        attribute_id: Number(attribute.attribute_id),
        value_id: Number(attribute.value_id),
      })) ?? [],
  }
}

const VariationRow: React.FC<{
  control: any
  t: (k: string) => string
  idx: number
  onRemove: () => void
  canRemove: boolean
}> = ({ control, t, idx, onRemove, canRemove }) => {
  const attributeId = useWatch({
    control,
    name: `variation_attributes.${idx}.attribute_id` as any,
  })

  return (
    <div className="grid grid-cols-2 gap-3 items-end rounded-md border p-3">
      {/* Attribute select */}
      <Field
        type="select"
        control={control}
        name={`variation_attributes.${idx}.attribute_id`}
        label={`${t('Form.labels.attribute')} #${idx + 1}`}
        inputProps={{
          endpoint: 'attributes?paginate=false',
          placeholder: t('Form.placeholders.attribute'),
          select: toSelectOptions,
        }}
      />

      <Field
        key={`value-${idx}-${attributeId ?? 'none'}`}
        type="select"
        control={control}
        name={`variation_attributes.${idx}.value_id`}
        label={t('Form.labels.value')}
        inputProps={{
          endpoint: attributeId
            ? `attribute-values?paginate=false&filters[attribute_id]=${attributeId}`
            : undefined,
          queryKey: queryKeys.attributeValues.filtered({ "filters[attribute_id]": attributeId }),
          placeholder: t('Form.placeholders.value'),
          disabled: !attributeId,
          select: toSelectOptions,
        }}
      />

      <div className="col-span-2 flex justify-end">
        {canRemove && (
          <button
            type="button"
            className="text-destructive text-sm"
            onClick={onRemove}
          >
            {t('actions.delete')}
          </button>
        )}
      </div>
    </div>
  )
}

const VariationAttributesRepeater: React.FC<{ t: (k: string) => string }> = ({
  t,
}) => {
  const { control } = useFormContext<ProductVariationFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variation_attributes',
  })

  const addRow = () => append({ attribute_id: undefined, value_id: undefined })

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{t('Form.labels.attributes')}</h3>
        <Button
          type="button"
          variant={'outline'}
          onClick={addRow}
        >
          {t('actions.add')}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((f, idx) => (
          <VariationRow
            key={f.id}
            control={control}
            t={t}
            idx={idx}
            onRemove={() => remove(idx)}
            canRemove={fields.length !== 1}
          />
        ))}

        {fields.length === 0 && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            {t('Form.messages.noAttributes')}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductVariationFormDialog({
  productId,
  isOpen,
  onClose,
  variation,
  productName,
}: {
  productId: number | string
  isOpen: boolean
  onClose: () => void
  variation?: ProductVariationWithGallery
  productName?: string | null
}) {
  const { t } = useTranslation()

  const schema = React.useMemo(
    () =>
      z
        .object({
          product_id: z.union([z.string(), z.number()]),
          price: z.coerce.number({ message: t('Validation.requiredSimple') }).positive({ message: t('Validation.positive') }),
          cost_price: z.coerce.number().nullable().optional(),
          discount_type: z.enum(['FIXED', 'PERCENTAGE']).nullable().optional(),
          discount_value: z.coerce.number().nullable().optional(),
          stock: z.coerce.number({ message: t('Validation.requiredSimple') }).int({ message: t('Validation.int') })
            .positive({ message: t('Validation.positive') }),
          is_active: z.coerce.boolean().optional().default(true),
          is_default: z.coerce.boolean().optional().default(false),
          sku: z.string().max(100).or(z.literal('')),
          barcode: z.string().max(100).or(z.literal('')),
          gallery: z.any().optional(),
          variation_attributes: z
            .array(
              z.object({
                attribute_id: z.string(),
                value_id: z.string(),
              }),
            )
            .default([]),
        })
        .superRefine((data, ctx) => {
          if (data.cost_price != null && data.price != null && Number(data.cost_price) >= Number(data.price)) {
            ctx.addIssue({
              code: 'custom',
              path: ['cost_price'],
              message: t('Validation.costPriceLessThanPrice'),
            })
          }

          if (
            data.discount_type === 'PERCENTAGE' &&
            data.discount_value != null &&
            Number(data.discount_value) > 100
          ) {
            ctx.addIssue({
              code: 'custom',
              path: ['discount_value'],
              message: t('Validation.percentage100'),
            })
          }
        }),
    [t],
  )

  const fields = React.useMemo(
    () => [
      ...buildVariationFields(t, variation?.id ? String(variation.id) : undefined).filter(
        (field) => !['sku', 'barcode'].includes(String(field.name)),
      ),
      {
        type: 'custom' as const,
        span: 2,
        customItem: <SkuCodeGenerator mode="variant" productId={productId} productName={productName} t={t} />,
      },
      {
        type: 'custom' as const,
        span: 2,
        customItem: <VariationAttributesRepeater t={t} />,
      },
    ],
    [productId, productName, t, variation?.id],
  )

  const endpoint = variation?.id
    ? `variants/${variation.id}`
    : `variants/product/${productId}`

  const { mutate, isPending } = useMutate({
    endpoint,
    mutationKey: queryKeys.products.getProduct(String(productId)),
    method: variation?.id ? 'patch' : 'post',
    invalidates: [queryKeys.products.all()],
    onSuccess: () => onClose(),
  })

  const handleSubmit = (values: ProductVariationFormData) => {
    mutate(buildVariationPayload(variation, values))
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (!open ? onClose() : undefined)}
    >
      <DialogContent className="bg-card border border-border rounded-lg shadow-sm  sm:max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base">
            {variation ? t('actions.update', { entity: t('common.variation') }) : t('actions.create', { entity: t('common.variation') })}
          </DialogTitle>
        </DialogHeader>
        <div className="pb-2 px-6">
          <AppForm<ProductVariationFormData>
            schema={schema}
            fields={fields}
            defaultValues={getVariationDefaultValues(productId, variation)}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            className="max-h-[70vh] overflow-y-auto py-4"
            formClassName="p-6 space-y-6"
            submitButtonText={
              variation
                ? t('actions.update', { entity: t('common.variation') })
                : t('actions.create', { entity: t('common.variation') })
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
