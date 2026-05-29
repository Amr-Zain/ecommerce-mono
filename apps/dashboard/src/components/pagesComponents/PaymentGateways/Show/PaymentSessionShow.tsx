import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PaymentSession } from "./Config";
import { SessionHeader } from "./components/SessionHeader";
import { OrderInfo } from "./components/OrderInfo";
import { PaymobDetails } from "./components/PaymobDetails";
import { TabbyDetails } from "./components/TabbyDetails";
import { TamaraDetails } from "./components/TamaraDetails";
import { ProviderResponseCard } from "./components/ProviderResponseCard";
import { CheckoutUrlsCard } from "./components/CheckoutUrlsCard";
import { MetadataCard } from "./components/MetadataCard";
import { SessionSidebar } from "./components/SessionSidebar";

interface PaymentSessionShowProps {
    session: PaymentSession;
}

/**
 * PaymentSessionShow Component
 * 
 * A comprehensive view for payment sessions that handles multiple providers (Paymob, Tabby)
 * and displays detailed transaction/intention data.
 */
export default function PaymentSessionShow({ session }: PaymentSessionShowProps) {
    const { t } = useTranslation();

    const order = session?.order;
    const provider = session?.provider;
    const providerResponse = session?.provider_response;
    const sdkParams = session?.sdk_parameters;

    // Translation helper for dynamic labels and settings keys
    const translateLabel = (key: string): string => {
        const translated = t(`paymentSessions.labels.${key}`);
        // Fallback to title-cased key if translation is missing
        return translated !== `paymentSessions.labels.${key}`
            ? translated
            : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Construction of checkout and redirection URLs from various response sources
    const checkoutUrls: { label: string; url: string }[] = [
        ...(sdkParams?.checkout_url ? [{ label: translateLabel('sdk_checkout_url'), url: sdkParams.checkout_url }] : []),
        ...(sdkParams?.redirection_url ? [{ label: translateLabel('sdk_redirection_url'), url: sdkParams.redirection_url }] : []),
        ...(providerResponse?.checkout_url ? [{ label: translateLabel('provider_checkout_url'), url: providerResponse.checkout_url }] : []),
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Main Header with Status and Primary Meta */}
            <SessionHeader session={session} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Primary Information Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Failure Reason Banner (Conditional) */}
                    {session.failure_reason && (
                        <div className="flex items-start gap-4 p-5 rounded-2xl border-1 border-red-900/20 bg-red-50/70 dark:bg-red-950/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-red-700 dark:text-red-300 uppercase tracking-widest leading-none">
                                    {t('paymentSessions.labels.failure_reason')}
                                </p>
                                <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400 break-all">
                                    {t(`paymentSessions.rejection_reasons.${session.failure_reason}`, { defaultValue: session.failure_reason })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Details (Pricing, status, and dates) */}
                    {order && <OrderInfo order={order} currency={session.currency} />}

                    {/* Paymob-specific details (Intention or Transaction format) */}
                    {provider?.identifier === 'paymob' && (
                        <PaymobDetails providerResponse={providerResponse} />
                    )}

                    {/* Tabby-specific details (Response object, products, etc.) */}
                    {provider?.identifier === 'tabby' && (
                        <TabbyDetails providerResponse={providerResponse} />
                    )}

                    {/* Tamara-specific details */}
                    {provider?.identifier === 'tamara' && (
                        <TamaraDetails providerResponse={providerResponse} />
                    )}

                    {/* Fallback/Additional Provider Data (Scalars not handled in specific blocks) */}
                    <ProviderResponseCard providerResponse={providerResponse} />

                    {/* Redirect and Checkout Links */}
                    <CheckoutUrlsCard urls={checkoutUrls} />

                    {/* Custom Session Metadata */}
                    <MetadataCard metadata={session.metadata || []} />
                </div>

                {/* Secondary Information Sidebar */}
                <div className="lg:col-span-1">
                    <SessionSidebar
                        session={session}
                        translateSdkKey={translateLabel}
                    />
                </div>
            </div>
        </div>
    );
}
