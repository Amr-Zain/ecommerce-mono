import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { ShopifyStoreDetails } from '@/types/api/shopify-store'
import { fieldsBuilder } from './Config'
import { useTranslation } from 'react-i18next'
import { ShopifyStoreFormData, makeShopifyStoreSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'

export default function ShopifyStoreForm({ store }: { store?: ShopifyStoreDetails }) {
    const { t } = useTranslation()
    const { mutate, isPending } = useMutate({
        endpoint: store?.id ? `shopify-stores/${store.id}` : 'shopify-stores',
        mutationKey: ['shopify-store', store?.id],
        invalidates: [queryKeys.shopifyStores.all()],
        method: store?.id ? 'patch' : 'post',
        redirectTo: '/settings/shopify-stores',
    })
    const fields = fieldsBuilder(t)

    const handleSubmit = (values: ShopifyStoreFormData) => {
        const payload = store?.id
            ? generateFinalOut(store, values)
            : values

        mutate(payload as any)
    }
    const schema = makeShopifyStoreSchema(t, !!store?.id)

    const defaultValues: Partial<ShopifyStoreFormData> = store ? {
        ...generateInitialValues(store),
        settings: {
            client_id: store.settings?.client_id || '',
            client_secret: store.settings?.client_secret || '',
            redirect_uri: store.settings?.redirect_uri || '',
            return_url: store.settings?.return_url || '',
            include_protected_topics: store.settings?.include_protected_topics ?? false,
            protected_customer_data_approved: store.settings?.protected_customer_data_approved ?? false,
            api_version: store.settings?.api_version || '',
            state_ttl: store.settings?.state_ttl ?? 600,
            scopes: Array.isArray(store.settings?.scopes)
                ? store.settings.scopes
                : typeof store.settings?.scopes === 'string'
                    ? store.settings.scopes.split(',').map(s => s.trim())
                    : [],
        }
    } : {
        shop_domain: '',
        is_active: true,
        settings: {
            client_id: '',
            client_secret: '',
            redirect_uri: '',
            return_url: '',
            include_protected_topics: false,
            protected_customer_data_approved: false,
            api_version: '',
            state_ttl: 600,
            scopes: [],
        }
    }

    return (
        <AppForm<ShopifyStoreFormData>
            schema={schema as any}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={store?.id ? 2 : 1}
            spacing="md"
            className={cn(
                "bg-card border border-border rounded-lg shadow-sm mx-auto mt-8",
                store?.id ? "max-w-5xl" : "max-w-xl"
            )}
            formClassName="p-6"
            submitButtonText={
                store?.id
                    ? t('actions.update', { entity: t('common.shopifyStore') })
                    : t('actions.create', { entity: t('common.shopifyStore') })
            }
        />
    )
}
