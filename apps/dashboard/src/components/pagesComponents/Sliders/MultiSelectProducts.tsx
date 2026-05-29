import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { Option } from '@ecommerce/ui/components/multi-select'
import MultipleSelector from '@ecommerce/ui/components/multi-select'
import { ApiResponseBase } from '@/types/api/http'
import useFetch from '@/hooks/UseFetch'
import { productsQueryKeys } from '@/util/queryKeysFactory'
import { Product } from '@/types/api/product'
import { useTranslation } from 'react-i18next'
import { FormLabel, FormMessage } from '@ecommerce/ui/components/form'

interface ProductOption extends Option {
  src?: string
  fallback?: string
}

type FormValues = {
  products: string[] // all values are strings now
}

const endpoint = 'products'

const MultiSelectProducts = () => {
  const [search, setSearch] = useState<string>()
  const { t } = useTranslation()
  const { control } = useFormContext<FormValues>()

  const { data: options = [], isPending } = useFetch<
    ApiResponseBase<Product[]>,
    ProductOption[]
  >({
    queryKey: productsQueryKeys.all(search),
    endpoint,
    params: { search },
    select: (data) =>{
      console.log(data)
      const items = data?.data?.map(
        (item) =>
          ({
            label: item.name,
            value: item.id.toString(),
            src: item.image?.url,
            fallback: item.name?item.name[0]?.toUpperCase():'A',
          }) as unknown as ProductOption,
        ) || []
      return items
      },
      })
      return (
    <Controller
      name="products"
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selectedOptions =
          options.filter((opt) => (field.value || []).includes(opt.value)) || []

        return (
          <>
            <FormLabel htmlFor="products" aria-invalid={!!error}>
              {t('Form.labels.products')}
            </FormLabel>

            <MultipleSelector
              value={selectedOptions}
              onChange={(values) => {
                const ids = values.map((v) => v.value.toString())
                field.onChange(ids)
              }}
              isPending={isPending}
              options={options}
              onSearch={async (value) => {
                setSearch(value)
                return options
              }}
              placeholder={t('Text.search')}
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  {t('Text.noResults')}
                </p>
              }
              className="w-full"
              badgeClassName="pl-1"
              // 🔽 this is the important part: mirror EditorField error handling
              inputProps={{
                id: 'products',
                'aria-invalid': !!error || undefined,
                'aria-describedby': error ? 'products-error' : undefined,
                onBlur: field.onBlur,
              }}
            />

            <FormMessage id="products-error">{error?.message}</FormMessage>
          </>
        )
      }}
    />
  )
}

export default MultiSelectProducts
