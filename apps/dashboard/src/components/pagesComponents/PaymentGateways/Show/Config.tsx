import { Badge } from '@ecommerce/ui/components/badge'
import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Image } from '@/types/api/general'
import { cn } from '@/lib/utils'
import { DateColumn, textColumn } from '@/components/features/sharedColumns'
import { SARIcon } from '@/components/common/Icons'

export interface PaymentSessionUser {
    id: number
    name: string | null
    email: string
    phone: string | null
    image: {
        id: number
        hash: string
        mime_type: string
        url: string
    } | null
}

export interface PaymentSessionOrder {
    id: number
    shopify_id: string | null
    shopify_order_id: string | null
    shopify_name: string | null
    order_number: string | number | null
    status: string
    financial_status: string
    fulfillment_status: string
    email: string
    phone: string
    currency: string
    total_price: number
    subtotal_price: number
    total_tax: number
    total_shipping: number
    processed_at: string | null
    paid_at: string | null
    fulfilled_at: string | null
    synced_at: string | null
    created_at: string
    updated_at: string
}

export interface PaymentSessionProvider {
    id: number | null
    identifier: string | null
    name: string | null
    description: string | null
    image: Image | string | null
    icon: string | null
    settings: Record<string, any> | null
    is_active: boolean | null
    created_at: string | null
}

export interface ProviderResponse {
    // --- Shared ---
    id?: string
    status?: string
    paymentStatus?: string
    amount?: string | number
    currency?: string
    created_at?: string
    expires_at?: string
    description?: string
    checkout_url?: string
    checkout_id?: string
    order_id?: string
    orderId?: string
    decline_type?: string
    user_type?: string
    session?: string
    is_test?: boolean
    confirmed?: boolean
    cancelable?: boolean
    refunds?: Array<any>
    captures?: Array<any>
    order_history?: Array<any>
    [key: string]: any

    // --- Paymob Intention format (pending state) ---
    object?: string
    special_reference?: string
    intention_order_id?: number | string
    client_secret?: string
    extras?: {
        creation_extras?: {
            order_id?: number
            merchant_order_id?: string
        }
        confirmation_extras?: any | null
    }
    payment_keys?: Array<{
        key?: string
        order_id?: number
        iframe_id?: number | null
        save_card?: boolean
        integration?: number
        gateway_type?: string
        redirection_url?: string
    }>
    payment_methods?: Array<{
        live?: boolean
        name?: string | null
        alias?: string | null
        currency?: string
        method_type?: string
        integration_id?: number
        use_cvc_with_moto?: boolean
    }>
    split_payment_methods?: Array<any>

    // --- Tabby-style top-level ---
    phase?: string
    provider_code?: string
    provider_status?: string
    provider_message?: string
    raw?: {
        id?: string
        token?: string | null
        status?: string
        rejection_reason_code?: string
        payment?: {
            id?: string
            meta?: any | null
            order?: {
                items?: Array<any>
                tax_amount?: string | number
                updated_at?: string
                reference_id?: string
                discount_amount?: string | number
                shipping_amount?: string | number
            }
            amount?: string | number
            status?: string
            is_test?: boolean
            currency?: string
            created_at?: string
            description?: string
        }
        configuration?: {
            products?: {
                installments?: {
                    type?: string
                    is_available?: boolean
                    rejection_reason?: string
                }
            }
            monthly_billing?: any | null
            available_products?: Array<any>
        }
        merchant_urls?: Record<string, string>
    }

    // --- Tabby-style legacy ---
    buyer?: {
        name?: string
        email?: string
        phone?: string
        dob?: string | null
    }
    order?: {
        reference_id?: string
        items?: Array<any>
        tax_amount?: string | number
        shipping_amount?: string | number
        discount_amount?: string | number
        updated_at?: string
    }
    payment?: {
        id?: string
        status?: string
        amount?: string | number
        currency?: string
        created_at?: string
        description?: string
    }
    product?: {
        type?: string
        installment_period?: string
        installments_count?: number
    }
    buyer_history?: {
        loyalty_level?: number
        wishlist_count?: number
        registered_since?: string
        is_email_verified?: boolean
    }
    configuration?: {
        available_products?: {
            installments?: Array<{
                web_url?: string
                installments?: Array<{
                    amount?: string | number
                    due_date?: string
                }>
            }>
        }
    }
    shipping_address?: {
        address?: string
        city?: string
        zip?: string
    }
    merchant_urls?: Record<string, string>

    // --- Paymob-style ---
    hmac?: string
    type?: string
    accept_fees?: number
    issuer_bank?: string | null
    transaction_processed_callback_responses?: Array<any> | null
    obj?: {
        id?: number
        data?: {
            message?: string
            acq_response_code?: string
            txn_response_code?: string
            [key: string]: any
        }
        order?: {
            id?: number
            currency?: string
            amount_cents?: number
            payment_status?: string
            merchant_order_id?: string
            shipping_data?: {
                id?: number
                city?: string
                email?: string
                first_name?: string
                last_name?: string
                phone_number?: string
                street?: string
                country?: string
                building?: string
                floor?: string
                apartment?: string
                postal_code?: string
                shipping_method?: string
                [key: string]: any
            }
            [key: string]: any
        }
        owner?: number
        is_auth?: boolean
        is_bill?: boolean
        is_live?: boolean
        is_void?: boolean
        pending?: boolean
        success?: boolean
        currency?: string
        is_refund?: boolean
        is_voided?: boolean
        api_source?: string
        created_at?: string
        updated_at?: string
        is_capture?: boolean
        is_settled?: boolean
        source_data?: {
            pan?: string
            type?: string
            tenure?: any | null
            sub_type?: string
        }
        amount_cents?: number
        is_3d_secure?: boolean
        error_occured?: boolean
        integration_id?: number
        captured_amount?: number
        is_refunded?: boolean
        is_captured?: boolean
        is_standalone_payment?: boolean
        payment_key_claims?: {
            extra?: { order_id?: number; merchant_order_id?: string }
            user_id?: number
            currency?: string
            order_id?: number
            amount_cents?: number
            integration_id?: number
            billing_data?: {
                city?: string
                email?: string
                floor?: string
                state?: string
                street?: string
                country?: string
                building?: string
                apartment?: string
                last_name?: string
                first_name?: string
                postal_code?: string
                phone_number?: string
                [key: string]: any
            }
            notification_url?: string
            next_payment_intention?: string
            [key: string]: any
        }
        [key: string]: any
    }

    // --- Paymob old-style (intention_detail) ---
    intention_detail?: {
        billing_data?: {
            first_name?: string
            last_name?: string
            email?: string
            phone_number?: string
            city?: string
            country?: string
            street?: string
            building?: string
            [key: string]: any
        }
        [key: string]: any
    }
}


export interface PaymentSession {
    id: number
    session_key: string
    user: PaymentSessionUser | null
    order: PaymentSessionOrder | null
    provider: PaymentSessionProvider | null
    provider_identifier?: string | null
    payment_method?: string | null
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled' | 'expired'
    amount: string | number
    currency: string
    transaction_ref?: string | null
    checkout_url?: string | null
    provider_order_id: string | null
    failure_reason: string | null
    provider_response: ProviderResponse | null
    sdk_parameters: Record<string, any> | null
    metadata: unknown
    pending_checkout_id?: string | null
    order_id?: string | null
    wallet_transaction_id?: string | null
    return_request_id?: string | null
    exchange_request_id?: string | null
    created_at: string
    updated_at: string
    completed_at: string | null
    expires_at: string | null
}

export const getSessionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
        case 'paid':
            return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
        case 'pending':
        case 'processing':
        case 'new':
        case 'intended':
            return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
        case 'failed':
        case 'failure':
        case 'rejected':
        case 'canceled':
        case 'cancelled':
        case 'cancel':
            return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800'
        case 'expired':
            return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800'
        default:
            return 'text-muted-foreground bg-muted border-border'
    }
}

export const paymentSessionColumns = (t: (key: string) => string): Array<ColumnDef<PaymentSession>> => [
    textColumn<PaymentSession>('user.name' as any, 'Form.labels.user_name', {
        render: ({ row }) => {
            const user = row.original.user
            if (!user) return 'N/A'
            return (
                <Link
                    to="/users/show/$id"
                    params={{ id: String(user.id) }}
                    className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {user.name || user.email}
                </Link>
            )
        }
    }),
    textColumn<PaymentSession>('user.email' as any, 'Form.labels.email', {
        render: ({ row }) => row.original.user?.email || 'N/A'
    }),
    textColumn<PaymentSession>('amount', 'table.price', {
        render: ({ row }) => (
            <span className="font-semibold tabular-nums inline-flex items-center gap-1">
                {row.original.amount} <SARIcon className="h-3 w-3" />
            </span>
        )
    }),
    textColumn<PaymentSession>('status', 'table.status', {
        render: ({ row }) => (
            <Badge
                variant="outline"
                className={cn(
                    'capitalize font-medium px-2.5 py-0.5 text-xs border',
                    getSessionStatusColor(row.original.status)
                )}
            >
                {t(`paymentSessions.status.${row.original.status}`) || row.original.status}
            </Badge>
        )
    }),
    DateColumn<PaymentSession>('created_at', 'table.createdAt'),
    DateColumn<PaymentSession>('expires_at', 'table.expiresAt'),
    {
        id: 'actions',
        header: () => <div className="text-start">{t('actions.entity')}</div>,
        cell: ({ row }) => (
            <Link
                to="/payment-gateways/sessions/$id"
                params={{ id: String(row.original.id) }}
                preload="intent"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Eye className="h-4 w-4" />
                {t('actions.show')}
            </Link>
        ),
    },
]
