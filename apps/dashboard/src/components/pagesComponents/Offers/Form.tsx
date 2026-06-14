import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { formDateToYYYYMMDD, generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/util/queryKeysFactory'
import { makeOfferSchema, OfferFormData } from '@/lib/schema'
import { buildOfferFields } from './Config'

export type OfferEntity = {
    id: number
    title: string
    is_active?: boolean
    discount_type?: 'fixed' | 'percentage'
    discount_value?: number
    start_at?: string
    end_at?: string
    translations?: {
        en?: { title?: string }
        ar?: { title?: string }
    }
    products?: { id: number; name: string }[]
}

export default function OfferForm({ offer }: { offer?: OfferEntity }) {
    const { t } = useTranslation()
    const schema = makeOfferSchema(t)
    const fields = buildOfferFields(t)

    const { mutate, isPending } = useMutate({
        endpoint: offer ? `offers/${offer.id}` : 'offers',
        mutationKey: queryKeys.offers.getOffer(String(offer?.id ?? 'new')),
        invalidates: [queryKeys.offers.all()],
        method: offer?.id ? 'patch' : 'post',
        redirectTo: '/offers',
    })

    // products field in OfferFormData is array of strings (ids)
    const handleSubmit = (values: OfferFormData) => {
        const finalOut = generateFinalOut(offer, values)
        mutate({
            ...finalOut,
            start_at: formDateToYYYYMMDD(values.start_at),
            end_at: formDateToYYYYMMDD(values.end_at),
            is_active: finalOut.is_active ? 1 : 0,
            // Ensure products are sent as expected (likely array of IDs)
            products: values.products
        })
    }

    return (
        <AppForm<OfferFormData>
            schema={schema as any}
            fields={fields}
            defaultValues={{
                ...generateInitialValues(offer),
                products: offer?.products?.map((p) => String(p.id)) ?? [],
                start_at: offer?.start_at ? new Date(offer.start_at) : undefined,
                end_at: offer?.end_at ? new Date(offer.end_at) : undefined,
                is_active: offer?.is_active ? true : false,
                discount_type: offer?.discount_type as "fixed" | "percentage"
            }}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            className="bg-card border border-border rounded-lg shadow-sm"
            formClassName="p-6"
            submitButtonText={
                offer
                    ? t('actions.update', { entity: t('common.offer') })
                    : t('actions.create', { entity: t('common.offer') })
            }
        />
    )
}
