import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { RefreshCw } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import Field from '@/components/common/form/Field'
import type { ProductFormData } from '@/lib/schema'
import type { ProductVariationFormData } from './Config'

type GeneratorMode = 'product' | 'variant'
type GeneratorFormData = ProductFormData | ProductVariationFormData

type SkuCodeGeneratorProps = {
  mode: GeneratorMode
  t: (key: string, values?: Record<string, unknown>) => string
  productId?: number | string
  productName?: string | null
}

const cleanSkuPart = (value: unknown, fallback: string) => {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()

  return (normalized || fallback).slice(0, 12)
}

const randomDigits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

const ean13Checksum = (first12Digits: string) => {
  const sum = first12Digits
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)

  return String((10 - (sum % 10)) % 10)
}

const generateInternalCode = () => {
  const now = new Date()
  const year = String(now.getFullYear()).slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const first12Digits = `20${year}${month}${day}${randomDigits(4)}`

  return `${first12Digits}${ean13Checksum(first12Digits)}`
}

const generateSku = ({
  mode,
  name,
  collectionId,
  productId,
}: {
  mode: GeneratorMode
  name?: unknown
  collectionId?: unknown
  productId?: number | string
}) => {
  const now = new Date()
  const datePart = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const scope = mode === 'variant' ? 'VAR' : 'PRD'
  const identity = mode === 'variant'
    ? `P${productId ?? 'NEW'}`
    : `C${collectionId || 'GEN'}`

  return `SKU-${scope}-${cleanSkuPart(name, scope)}-${identity}-${datePart}-${randomDigits(4)}`
}

export default function SkuCodeGenerator({ mode, t, productId, productName }: SkuCodeGeneratorProps) {
  const form = useFormContext<GeneratorFormData>()
  const nameEn = useWatch({ control: form.control, name: 'name_en' as never })
  const nameAr = useWatch({ control: form.control, name: 'name_ar' as never })
  const collectionId = useWatch({ control: form.control, name: 'collection_id' as never })

  const handleGenerate = () => {
    const sku = generateSku({
      mode,
      name: productName || nameEn || nameAr,
      collectionId,
      productId,
    })

    form.setValue('sku' as never, sku as never, { shouldDirty: true, shouldValidate: true })
    form.setValue('barcode' as never, generateInternalCode() as never, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <div className="col-span-2 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
      <Field
        type="text"
        name={'sku' as never}
        control={form.control}
        label={t('Form.labels.sku')}
        placeholder={t('Form.placeholders.sku')}
      />
      <Field
        type="text"
        name={'barcode' as never}
        control={form.control}
        label={t('table.columns.barcode')}
        placeholder={t('Form.placeholders.barcode')}
      />
      <Button
        type="button"
        variant="outline"
        className="h-10 gap-2 md:mb-[2px]"
        onClick={handleGenerate}
      >
        <RefreshCw className="h-4 w-4" />
        {t('actions.generate') || 'Generate'}
      </Button>
    </div>
  )
}
