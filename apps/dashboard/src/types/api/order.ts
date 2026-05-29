export interface Money {
    amount: string
    currency_code: string
}

export interface PriceSet {
    shop_money: Money
    presentment_money: Money
}

export interface OrderIntegrationAccount {
    id: string
    shop_domain: string
}

export interface OrderUser {
    id: number
    name: string
    email: string
}

export interface OrderCart {
    id: number
    token: string
    status: string | null
}

export interface OrderAddress {
    zip: string | null
    city: string
    name: string
    phone: string | null
    company: string | null
    country: string
    address1: string
    address2: string | null
    latitude: number | null
    province: string | null
    last_name: string
    longitude: number | null
    first_name: string
    country_code: string
    province_code: string | null
}

export interface ShippingLine {
    id: number
    code: string
    phone: string | null
    price: string
    title: string
    source: string | null
    price_set?: PriceSet
    tax_lines?: any[]
    is_removed?: boolean
    discounted_price?: string
    carrier_identifier?: string | null
    discount_allocations?: any[]
    discounted_price_set?: PriceSet
    current_discounted_price_set?: PriceSet
    requested_fulfillment_service_id?: string | null
}

export interface AppliedDiscount {
    amount: number
    title: string | null
    code?: string | null
    type?: string | null
    raw?: any
}

export interface OrderItem {
    id: number
    shopify_line_item_id: string
    shopify_variant_id: string | null
    sku: string
    title: string
    variant_title: string | null
    quantity: number
    price: number
    total_discount: number
    tax_total: number
    total: number
    fulfillment_status: string | null
    properties: any[]
    applied_discounts: AppliedDiscount[] | null
    requires_shipping: boolean
    vendor?: string | null
    fulfillment_service?: string | null
    price_set?: PriceSet
    total_discount_set?: PriceSet
    admin_graphql_api_id?: string | null
    product: {
        id: number
        name: string
        sku: string
    } | null
    variation: {
        id: number
        sku: string
    } | null
}

export interface OrderPayment {
    id: number
    shopify_id?: string
    shopify_transaction_id: string | null
    kind: string
    status: string
    gateway: string
    payment_method: string
    amount: number
    currency: string
    processed_at: string | null
    authorization: string | null
    error_code: string | null
    receipt: any | null
    raw: any | null
}

export interface OrderCustomer {
    id: number
    note: string | null
    email: string
    phone: string | null
    state: string
    currency: string
    last_name: string
    created_at: string
    first_name: string
    tax_exempt: boolean
    updated_at: string
    tax_exemptions: any[]
    verified_email: boolean
    default_address: (OrderAddress & { id: number, default: boolean, customer_id: number, country_name: string }) | null
    admin_graphql_api_id: string
    multipass_identifier: string | null
}

export interface OrderShipment {
    id: number
    shopify_fulfillment_id: string
    status: string
    service: string
    tracking_company: string | null
    tracking_number: string | null
    tracking_url: string | null
    tracking_numbers: string[]
    tracking_urls: string[]
    line_item_ids: number[]
    raw: any
    shipped_at: string | null
    delivered_at: string | null
}

export interface FulfillmentTracking {
    tracking_number: string | null
    tracking_numbers: string[]
    tracking_company: string | null
    tracking_url: string | null
    tracking_urls: string[]
    shipment_status: string | null
}

export interface ClientDetails {
    browser_ip: string | null
    user_agent: string | null
    accept_language: string | null
    browser_width: number | null
    browser_height: number | null
    session_hash: string | null
}

export interface OrderDiscount {
    code: string | null
    amount: number
    type?: string | null
    title?: string | null
}

export interface DiscountDetails {
    total_discount: number
    order_discounts: OrderDiscount[]
    line_discounts: any[]
}

export interface RawLineItem {
    id: number | string
    sku: string | null
    title: string
    quantity: number
    price: string | number
    properties: { name: string, value: string }[]
    gift_card: boolean
    discount_allocations?: {
        amount: string
        amount_set: any
        discount_application_index: number
    }[]
    [key: string]: any
}

export interface RawPayload {
    id: number | string
    name: string
    note: string | null
    note_attributes: { name: string, value: string }[]
    line_items: RawLineItem[]
    discount_codes?: {
        code: string
        type: string
        amount: string
    }[]
    shipping_lines?: any[]
    total_price?: string
    subtotal_price?: string
    total_tax?: string
    total_discounts?: string
    [key: string]: any
}

export interface Order {
    id: number
    shopify_id?: string
    shopify_order_id: string
    shopify_name: string
    order_number: number
    status: string
    financial_status: string
    fulfillment_status: string | null
    email: string
    phone: string | null
    currency: string
    total_price: number
    subtotal_price: number
    total_tax: number
    total_shipping: number
    integration_account: OrderIntegrationAccount
    user: OrderUser
    cart: OrderCart | null
    processed_at: string
    paid_at: string | null
    fulfilled_at: string | null
    synced_at: string
    created_at: string
    updated_at: string
}

export interface OrderDetail extends Order {
    payment_gateway: string | null
    payment_gateway_names?: string[]
    processing_method: string | null
    cancel_reason: string | null
    note: string | null
    tags: string | null
    shipping_address: OrderAddress | null
    billing_address: OrderAddress | null
    shipping_lines: ShippingLine[]
    discount_codes: any[]
    discount_details?: DiscountDetails
    tax_lines: any[]
    customer: OrderCustomer | null
    items: OrderItem[]
    payments: OrderPayment[]
    shipments: OrderShipment[]
    fulfillment_tracking?: FulfillmentTracking | null
    closed_at: string | null
    cancelled_at: string | null
    total_outstanding?: string | number
    current_total_price?: string | number
    current_total_price_set?: PriceSet
    current_total_tax?: string | number
    current_total_tax_set?: PriceSet
    current_subtotal_price?: string | number
    current_subtotal_price_set?: PriceSet
    current_total_discounts?: string | number
    current_total_discounts_set?: PriceSet
    checkout_id?: number | null
    checkout_token?: string | null
    source_name?: string | null
    customer_locale?: string | null
    test?: boolean
    confirmed?: boolean
    contact_email?: string | null
    total_weight?: number
    confirmation_number?: string | null
    referring_site?: string | null
    landing_site?: string | null
    total_tip_received?: string | number
    order_status_url?: string | null
    browser_ip?: string | null
    client_details?: ClientDetails | null
    raw_payload?: RawPayload | null
    discount_applications?: any[]
    total_line_items_price?: string | number
    buyer_accepts_marketing?: boolean
}
