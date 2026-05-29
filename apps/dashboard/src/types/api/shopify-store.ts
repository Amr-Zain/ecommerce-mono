export interface ShopifyStore {
    id: string
    provider: string
    shop_domain: string
    status: string
    is_active: boolean
    is_connected: boolean
    has_token: boolean
    has_client_secret: boolean
    installed_at: string | null
    last_sync_at: string | null
    created_at: string
}

export interface ShopifyStoreSettings {
    client_id: string | null
    client_secret?: string | null
    redirect_uri: string | null
    return_url: string | null
    include_protected_topics: boolean
    protected_customer_data_approved: boolean
    api_version: string | null
    state_ttl: number
    scopes: string[] | string
}

export interface ShopifyWebhook {
    id: number
    topic: string
    address: string
    format: string
    api_version: string
    created_at: string
    updated_at: string
}

export interface ShopifyStoreDetails extends ShopifyStore {
    settings: ShopifyStoreSettings | null
    last_error: string | null
    disconnected_at: string | null
    updated_at: string
}
