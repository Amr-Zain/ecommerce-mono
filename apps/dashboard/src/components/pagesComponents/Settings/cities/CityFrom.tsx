// src/features/cities/CityForm.tsx
import z from 'zod/v4'
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { City } from '@/types/api/country'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { buildCityFields } from './config'
import { useTranslation } from 'react-i18next'
import { CityFormData, makeCitySchema } from '@/lib/schema'



export default function CityForm({ city }: { city?: City }) {
  const { t } = useTranslation()
  const schema = makeCitySchema(t)
  const fields = buildCityFields(t)
  const { mutate, isPending } = useMutate({
    endpoint: city ? `cities/${city.id}` : 'cities',
    mutationKey: queryKeys.cities.getCity(city?.id),
    invalidates: [queryKeys.cities.all()],
    method: 'post',
    redirectTo: '/settings/cities',
    formData: true,
  })

  const handleSubmit = (values: CityFormData) => {
    const payload = {
      ...values,
      lat: values.map.lat,
      lng: values.map.lng,
      _method: city?.id ? 'patch' : 'post',
    }
    mutate(generateFinalOut(city,payload))
  }

  return (
    <AppForm<CityFormData>
      schema={schema}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(city),
        map:
          city && city?.location
            ? {
                lat: Number(city.location.lat),
                lng: Number((city as any).location.lng),
              }
            : undefined,
        country_id: String(city?.country?.id),
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        city
          ? t('actions.update', { entity: t('common.city') })
          : t('actions.create', { entity: t('common.city') })
      }
    />
  )
}
