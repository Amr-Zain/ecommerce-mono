import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { CountryDetails } from '@/types/api/country'
import { fieldsBuilder } from './Config'
import { useTranslation } from 'react-i18next'
import { CountryFormData, makeCountrySchema } from '@/lib/schema'

export default function CountryForm({ country }: { country?: CountryDetails }) {
  const { t } = useTranslation()
  const { mutate, isPending } = useMutate({
    endpoint: country?.id ? `countries/${country.id}` : 'countries',
    mutationKey: ['country', country?.id],
    invalidates: [queryKeys.countries.all()],
    method: country?.id ? 'patch' : 'post',
    redirectTo: '/settings/countries',
  })
  const fields = fieldsBuilder(t)
  const handleSubmit = (values: CountryFormData) => {
    mutate(generateFinalOut(country, values))
  }
  const schema = makeCountrySchema(t)
  return (
    <AppForm<CountryFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={generateInitialValues(country)}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm max-w-5xl mx-auto mt-8"
      formClassName="p-6"
      submitButtonText={
        country?.id
          ? t('actions.update', { entity: t('common.country') })
          : t('actions.create', { entity: t('common.country') })
      }
    />
  )
}
