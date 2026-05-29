import { OrderDetail, OrderItem, OrderPayment } from "@/types/api/order";
import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import {
    ShoppingCart,
    Calendar,
    User,
    CreditCard,
    MapPin,
    Package,
    Truck,
    Hash,
    Mail,
    Phone,
    DollarSign,
    FileText,
    Tag,
    Link2,
    Clock,
    CheckCircle2,
    Monitor,
    Globe,
    ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn, hasPermission } from "@/lib/utils";
import { getStatusColor } from "./Config";
import { Separator } from "@ecommerce/ui/components/separator";
import { Link } from "@tanstack/react-router";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { SARIcon } from "@/components/common/Icons";
import { Button } from "@ecommerce/ui/components/button";

interface OrderShowProps {
    order: OrderDetail;
}

export default function OrderShow({ order }: OrderShowProps) {
    const { t } = useTranslation();
    const noteAttributes = order.raw_payload?.note_attributes || [];
    const giftCardAttributes = noteAttributes.filter(attr =>
        attr.name.toLowerCase().includes('gift_card')
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        {t('orders.entity')} {order.shopify_name}
                        {order.test && (
                            <Badge variant="destructive" className="uppercase text-[9px] font-black tracking-widest px-2 py-0 border-none bg-red-500 hover:bg-red-600 animate-pulse">
                                {t('orders.labels.test_order')}
                            </Badge>
                        )}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Hash className="h-4 w-4" />
                        <>
                            {order.order_number && <span>#{order.order_number}</span>}
                            <span>•</span>
                        </>
                        {order.processed_at && <>
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.processed_at).toLocaleString()}</span>
                        </>}
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{t('orders.labels.status')}:</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'capitalize font-medium px-3 py-1 text-sm border',
                                getStatusColor(order.status)
                            )}
                        >
                            {t(`orders.status.${order.status}`) || order.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{t('orders.labels.financial_status')}:</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'capitalize font-medium px-3 py-1 text-sm border',
                                getStatusColor(order.financial_status)
                            )}
                        >
                            {t(`orders.financialStatus.${order.financial_status}`) || order.financial_status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">{t('orders.labels.fulfillment_status')}:</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'capitalize font-medium px-3 py-1 text-sm border',
                                getStatusColor(order.fulfillment_status || 'pending')
                            )}
                        >
                            {t(`orders.fulfillmentStatus.${order.fulfillment_status || 'unfulfilled'}`) || order.fulfillment_status || t('orders.fulfillmentStatus.unfulfilled')}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Left 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Package className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('orders.labels.items')}</CardTitle>
                                <Badge variant="secondary" className="ms-auto font-bold">
                                    {order.items?.length || 0} {t('orders.labels.items_count')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-0 p-0">
                            {order.items?.map((item: OrderItem, index: number) => (
                                <div key={item.id}>
                                    <div className="flex items-start gap-4 px-6 py-4">
                                        <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-muted/50 border border-muted flex items-center justify-center overflow-hidden">
                                            <Package className="h-7 w-7 text-muted-foreground/40" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <Link
                                                to="/products/show/$id"
                                                disabled={!hasPermission('products', 'show') || !item.product?.id}
                                                params={{ id: (item.product?.id || item.id).toString() }}
                                                className="font-bold text-sm leading-tight hover:text-primary transition-colors block"
                                            >
                                                {item.title}
                                            </Link>
                                            {item.variant_title && (
                                                <p className="text-xs text-muted-foreground font-medium">{item.variant_title}</p>
                                            )}
                                            {item.vendor && (
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-1">
                                                    <Truck className="h-3 w-3" /> {t('orders.labels.vendor')}: {item.vendor}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                                {item.sku && <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">{t('orders.labels.sku') || 'SKU'}: {item.sku}</span>}
                                                <span className="font-bold">× {item.quantity}</span>

                                                {item.fulfillment_status && (
                                                    <Badge variant="outline" className="text-[8px] h-4 py-0 font-black uppercase bg-blue-50 text-blue-700 border-blue-200">
                                                        {item.fulfillment_status}
                                                    </Badge>
                                                )}

                                                {/* {!item.requires_shipping && (
                                                    <Badge variant="outline" className="text-[8px] h-4 py-0 font-black uppercase bg-amber-50 text-amber-700 border-amber-200">
                                                        {t('orders.labels.requires_shipping') === 'Requires Shipping' ? 'Digital' : 'رقمي'}
                                                    </Badge>
                                                )} */}
                                            </div>

                                            {item.properties && item.properties.length > 0 && (
                                                <div className="mt-2 space-y-1 bg-muted/30 p-2 rounded-lg border border-dashed border-muted">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('orders.labels.properties')}</p>
                                                    {item.properties.map((prop, pIdx) => (
                                                        <div key={pIdx} className="flex justify-between text-[10px]">
                                                            <span className="font-medium text-muted-foreground">{prop.name.replace(/_/g, ' ')}:</span>
                                                            <span className="font-bold">{prop.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {item.applied_discounts && Array.isArray(item.applied_discounts) && item.applied_discounts.reduce((acc, d) => acc + (d.amount || 0), 0) > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {item.applied_discounts.map((discount, dIdx) => (
                                                        discount.amount > 0 && (
                                                            <Badge key={dIdx} variant="secondary" className="text-[8px] px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                                                                {discount.title || discount.code || t('orders.labels.discount') || 'Discount'}: {discount.amount?.toLocaleString()} {order.currency}
                                                            </Badge>
                                                        )
                                                    ))}
                                                </div>
                                            )}

                                            {item.variation && (
                                                <p className="text-[9px] text-muted-foreground mt-1 tabular-nums">
                                                    {t('orders.labels.shopify_variant_id')}: <span className="font-mono">{item.shopify_variant_id || item.variation.id}</span>
                                                </p>
                                            )}

                                            {/* Line Item Properties from raw_payload */}
                                            {/* {(() => {
                                                const rawItem = order.raw_payload?.line_items?.find(li => li.id.toString() === item.shopify_line_item_id);
                                                const properties = rawItem?.properties || [];
                                                if (properties.length === 0) return null;
                                                return (
                                                    <div className="mt-2 space-y-1">
                                                        {properties.map((prop, pIdx) => (
                                                            <p key={pIdx} className="text-[10px] text-muted-foreground flex gap-1">
                                                                <span className="font-black">{prop.name}:</span>
                                                                <span>{prop.value}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                );
                                            })()} */}

                                            {/* Gift Card Attributes */}
                                            {item.title.toLowerCase().includes('gift card') && giftCardAttributes.length > 0 && (
                                                <div className="mt-3 space-y-2 bg-amber-50/30 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Tag className="h-3 w-3 text-amber-600" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                                                            {t('orders.labels.gift_card_details')}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-1.5">
                                                        {giftCardAttributes.map((attr, aIdx) => (
                                                            <div key={aIdx} className="flex flex-col">
                                                                <span className="text-[9px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-tighter">
                                                                    {attr.name.replace('gift_card: ', '').replace('gift_card:', '').trim()}
                                                                </span>
                                                                <span className="text-xs font-black text-amber-900 dark:text-amber-100">{attr.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-end flex-shrink-0 space-y-1">
                                            <p className="font-black tabular-nums flex items-center gap-1 justify-end">{item.total?.toLocaleString()} <SARIcon className="h-4 w-4" /></p>
                                            {item.total_discount > 0 && (
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">-{item.total_discount?.toLocaleString()} {t('orders.labels.discount')}</p>
                                            )}
                                            {item.tax_total > 0 && (
                                                <p className="text-[9px] text-muted-foreground font-medium">{item.tax_total?.toLocaleString()} {t('orders.labels.tax_total')}</p>
                                            )}
                                        </div>
                                    </div>
                                    {index < (order.items?.length || 0) - 1 && <Separator className="opacity-50" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Fulfillment Tracking Summary Card */}
                    {order.fulfillment_tracking && (
                        <Card className="shadow-sm border-primary/20 overflow-hidden border-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                        <Truck className="h-6 w-6 sparkle" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-black uppercase tracking-tight">{t('orders.labels.fulfillment_tracking')}</CardTitle>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{order.fulfillment_tracking.tracking_company}</p>
                                    </div>
                                    {order.fulfillment_tracking.shipment_status && (
                                        <Badge
                                            className={cn(
                                                "ms-auto font-black uppercase text-[9px] tracking-tighter px-2",
                                                order.fulfillment_tracking.shipment_status === 'fulfilled' || order.fulfillment_tracking.shipment_status === 'success' ? "bg-emerald-500 text-white border-none" : "bg-amber-500 text-white border-none"
                                            )}
                                        >
                                            {order.fulfillment_tracking.shipment_status}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-primary/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('orders.labels.tracking_number')}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-mono font-black text-primary leading-none">{order.fulfillment_tracking.tracking_number}</span>
                                            <ButtonCopy content={order.fulfillment_tracking.tracking_number || ''} className="h-8 w-8 text-primary shadow-sm" />
                                        </div>
                                    </div>
                                    {order.fulfillment_tracking.tracking_url && (
                                        <Button className="font-black uppercase tracking-tight h-11 px-6 shadow-primary/20 rounded-xl">
                                            <a href={order.fulfillment_tracking.tracking_url} target="_blank" rel="noopener noreferrer">
                                                <Truck className="h-4 w-4 me-2" />
                                                {t('orders.labels.track_order')}
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                {order.fulfillment_tracking.tracking_urls && order.fulfillment_tracking.tracking_urls.length > 1 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {order.fulfillment_tracking.tracking_urls.map((url, idx) => (
                                            <Button key={idx} variant="outline" size="sm" className="text-[9px] font-bold h-7 bg-background/50 px-2">
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    {t('orders.labels.track_order')} #{idx + 1}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {order.shipments && order.shipments.length > 0 && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{t('orders.labels.fulfillments')}</CardTitle>
                                    <Badge variant="secondary" className="ms-auto font-black uppercase text-[10px]">
                                        {order.shipments.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 p-0">
                                {order.shipments.map((shipment, index) => (
                                    <div key={shipment.id} className="group">
                                        <div className="px-6 py-6 space-y-6">
                                            {/* Shipment Header */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner group-hover:bg-primary/10 transition-colors">
                                                        <Package className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-sm">{shipment.raw?.name || shipment.shopify_fulfillment_id}</p>
                                                            <Badge
                                                                className={cn(
                                                                    "text-[9px] h-4 py-0 font-black uppercase tracking-tighter",
                                                                    shipment.status === 'success' || shipment.status === 'fulfilled' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                                                                )}
                                                            >
                                                                {shipment.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                                            {shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleString() : t('common.loading')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {shipment.tracking_url && (
                                                        <Button variant="outline" size="sm" className="h-9 shadow-sm font-bold">
                                                            <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                                                                <Truck className="h-4 w-4 me-2 text-primary" />
                                                                {t('orders.labels.track_order') || 'Track Order'}
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tracking & Logistics Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-muted/30 rounded-2xl p-4 border border-muted/20 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('orders.labels.details')}</p>
                                                        <span className="text-[9px] font-mono font-bold text-muted-foreground/60">ID: {shipment.shopify_fulfillment_id}</span>
                                                    </div>

                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">{t('orders.labels.shipping_method')}:</span>
                                                            <span className="font-bold">{shipment.tracking_company || shipment.service}</span>
                                                        </div>
                                                        {shipment.tracking_number && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-muted-foreground">{t('orders.labels.tracking_number')}:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-black text-primary">{shipment.tracking_number}</span>
                                                                    <ButtonCopy content={shipment.tracking_number} className="h-5 w-5" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {shipment.delivered_at && (
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">{t('orders.labels.delivered_at')}:</span>
                                                                <span className="font-bold text-emerald-600">{new Date(shipment.delivered_at).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {shipment.raw?.location_id && (
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">{t('orders.labels.location_id')}:</span>
                                                                <span className="font-mono font-bold">{shipment.raw.location_id}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-muted/30 rounded-2xl p-4 border border-muted/20 space-y-3">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('orders.labels.items')}</p>
                                                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {order.items?.filter(item => shipment.line_item_ids.includes(parseInt(item.shopify_line_item_id))).map(item => (
                                                            <div key={item.id} className="flex items-center justify-between text-[11px] font-bold group/item">
                                                                <span className="truncate max-w-[85%] group-hover/item:text-primary transition-colors">{item.title}</span>
                                                                <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md min-w-[24px] text-center">×{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Multiple Tracking URLs if they exist */}
                                            {shipment.tracking_urls && shipment.tracking_urls.length > 1 && (
                                                <div className="pt-2">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                                                        <Link2 className="h-3 w-3" /> {t('orders.labels.tracking_urls')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {shipment.tracking_urls.map((url, uIdx) => (
                                                            <Button key={uIdx} variant="secondary" size="sm" className="text-[9px] h-6 font-bold px-2">
                                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                                    {t('orders.labels.track_order')} #{uIdx + 1}
                                                                </a>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {index < order.shipments.length - 1 && <Separator className="opacity-50" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Price Summary */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('orders.labels.price_summary')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">{t('orders.labels.subtotal')}</span>
                                    <span className="font-bold tabular-nums flex items-center gap-1">
                                        {order.subtotal_price?.toLocaleString()}
                                        {order.current_subtotal_price !== undefined && parseFloat(order.current_subtotal_price.toString()) !== order.subtotal_price && (
                                            <span className="text-[10px] text-primary bg-primary/10 px-1 rounded ml-1">
                                                ({t('orders.labels.current')}: {parseFloat(order.current_subtotal_price.toString()).toLocaleString()})
                                            </span>
                                        )}
                                        <SARIcon className="h-4 w-4" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">{t('orders.labels.shipping')}</span>
                                    <span className="font-bold tabular-nums flex items-center gap-1">{order.total_shipping?.toLocaleString()} <SARIcon className="h-4 w-4" /></span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">{t('orders.labels.tax')}</span>
                                    <span className="font-bold tabular-nums flex items-center gap-1">{order.total_tax?.toLocaleString()} <SARIcon className="h-4 w-4" /></span>
                                </div>
                                {order.total_line_items_price !== undefined && parseFloat(order.total_line_items_price.toString()) !== order.subtotal_price && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">{t('orders.labels.total_line_items_price') || 'Total Items Price'}</span>
                                        <span className="font-bold tabular-nums flex items-center gap-1">
                                            {parseFloat(order.total_line_items_price.toString()).toLocaleString()}
                                            <SARIcon className="h-4 w-4" />
                                        </span>
                                    </div>
                                )}
                                {(() => {
                                    const totalDiscount = order.discount_details?.total_discount || (order.subtotal_price + order.total_shipping + order.total_tax - order.total_price);
                                    if (totalDiscount <= 0) return null;

                                    return (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
                                                <span className="font-medium text-[11px] uppercase tracking-wider opacity-90">{t('orders.labels.discount')}</span>
                                                <span className="font-black tabular-nums flex items-center gap-1">
                                                    -{totalDiscount.toLocaleString()}
                                                    <SARIcon className="h-4 w-4 text-inherit" />
                                                </span>
                                            </div>
                                            {order.discount_details?.order_discounts?.map((discount, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[11px] text-emerald-600/80 dark:text-emerald-400/80 ps-4 font-bold border-l-2 border-emerald-500/20 ms-1 py-0.5">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <Tag className="h-3 w-3 flex-shrink-0 opacity-70" />
                                                        <span className="truncate">{discount.code || discount.title || t('orders.labels.discount')}</span>
                                                    </div>
                                                    <span className="tabular-nums flex items-center gap-1">
                                                        -{discount.amount?.toLocaleString()}
                                                        <SARIcon className="h-3.5 w-3.5 text-inherit" />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                                {order.total_tip_received !== undefined && parseFloat(order.total_tip_received.toString()) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-amber-600 dark:text-amber-400">
                                        <span className="font-medium">{t('orders.labels.tip')}</span>
                                        <span className="font-bold tabular-nums flex items-center gap-1">
                                            {parseFloat(order.total_tip_received.toString()).toLocaleString()}
                                            <SARIcon className="h-4 w-4 text-inherit" />
                                        </span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black">{t('orders.labels.total')}</span>
                                    <div className="text-end">
                                        <span className="text-2xl font-black text-primary tabular-nums flex items-center gap-1.5 justify-end">
                                            {order.total_price?.toLocaleString()}
                                            <SARIcon className="h-6 w-6" />
                                        </span>
                                    </div>
                                </div>

                                {order.total_outstanding !== undefined && parseFloat(order.total_outstanding.toString()) !== 0 && (
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-red-500/20">
                                        <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{t('orders.labels.total_outstanding')}</span>
                                        <span className="font-black tabular-nums flex items-center gap-1 text-red-600 dark:text-red-400">
                                            {parseFloat(order.total_outstanding.toString()).toLocaleString()}
                                            <SARIcon className="h-4 w-4 text-inherit" />
                                        </span>
                                    </div>
                                )}

                                {(order.current_total_price_set || order.current_total_price) && (
                                    <div className="flex justify-between items-center pt-2 border-t border-primary/20 bg-primary/5 p-2 rounded-lg mt-2">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">{t('orders.labels.current_total_price')}</span>
                                        <div className="text-end">
                                            <span className="font-black tabular-nums flex items-center gap-1 text-primary text-base justify-end">
                                                {(order.current_total_price_set?.shop_money.amount || order.current_total_price?.toString() || '0').toLocaleString()}
                                                <SARIcon className="h-4 w-4 text-inherit" />
                                            </span>
                                            {order.current_total_price_set && (
                                                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                    {order.current_total_price_set.shop_money.currency_code} ({t('orders.labels.shop_label')})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payments */}
                    {order.payments && order.payments.length > 0 && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 pb-2">
                                <div className="flex items-center gap-2 pt-4">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{t('orders.labels.payments')}</CardTitle>
                                    <Badge variant="secondary" className="ms-auto font-black">
                                        {order.payments.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 p-0 max-h-[400px] overflow-y-auto">
                                {order.payments.map((payment: OrderPayment, index: number) => (
                                    <div key={payment.id}>
                                        <div className="px-6 py-5 space-y-4">
                                            {/* Payment Header */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
                                                    <CreditCard className="h-7 w-7 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className="font-black text-base capitalize">{payment.gateway || payment.payment_method}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                        <span className="capitalize px-1.5 py-0.5 bg-muted rounded">{payment.kind}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'capitalize text-[10px] px-2 py-0.5 border font-bold shadow-sm',
                                                                getStatusColor(payment.status === 'success' || payment.status === 'completed' ? 'paid' : payment.status)
                                                            )}
                                                        >
                                                            {t(`orders.status.${payment.status}`) || payment.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-end flex-shrink-0">
                                                    <p className="font-black text-lg tabular-nums flex items-center gap-1 justify-end">{payment.amount?.toLocaleString()} <SARIcon className="h-5 w-5" /></p>
                                                    <div className="flex items-center gap-1 justify-end text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <p className="text-[10px] font-bold">{payment.processed_at ? new Date(payment.processed_at).toLocaleString() : '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Payment Details */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 rounded-2xl p-4 border border-muted/40">
                                                {payment.shopify_transaction_id && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black flex items-center gap-1">
                                                            <Hash className="h-3 w-3" /> {t('orders.labels.transaction_id')}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-[11px] font-mono font-bold truncate">{payment.shopify_transaction_id}</p>
                                                            <ButtonCopy content={payment.shopify_transaction_id} className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                )}
                                                {payment.authorization && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t('orders.labels.authorization')}</p>
                                                        <p className="text-[11px] font-mono font-bold">{payment.authorization}</p>
                                                    </div>
                                                )}
                                                {payment.payment_method && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{t('orders.labels.payment_method')}</p>
                                                        <p className="text-[11px] font-bold capitalize">{payment.payment_method}</p>
                                                    </div>
                                                )}
                                                {payment.error_code && (
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase tracking-widest font-black text-red-500">{t('orders.labels.error_code')}</p>
                                                        <p className="text-[11px] font-mono font-black text-red-600 dark:text-red-400">{payment.error_code}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {index < order.payments.length - 1 && <Separator className="opacity-50" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right col */}
                <div className="space-y-6">
                    {/* Notes & Additional Details */}
                    {(order?.note || noteAttributes?.length > 0) && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <CardHeader className="border-b border-muted/40 pb-2! flex flex-row items-center justify-between">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> {t('orders.labels.note')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-3">
                                {order?.note && <p className="text-sm font-medium text-foreground/80 leading-relaxed italic pb-2">{order.note}</p>}
                                {order?.note && <Separator className="opacity-50" />}
                                {noteAttributes?.length > 0 && (
                                    <Card className="shadow-none border-none bg-transparent py-2! gap-0">
                                        <CardHeader className="px-0 pb-2 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm font-semibold">
                                                {t('orders.labels.note_attributes')}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-2 pt-1 space-y-4">
                                            {noteAttributes.map((attr, idx) => {
                                                const cleanLabel = attr.name.replace('gift_card: ', '').replace('gift_card:', '').trim();
                                                return (
                                                    <div key={idx} className="space-y-0.5">
                                                        <p className="text-xs font-medium text-muted-foreground">{cleanLabel}</p>
                                                        <p className="text-sm text-foreground/90">{attr.value}</p>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    )}


                    {/* Customer Info */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> {t('common.user')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-4">
                            {order.user && (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/users/show/$id"
                                        disabled={!hasPermission('users', 'show')}
                                        params={{ id: order.user.id.toString() }}
                                        className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner border border-primary/20 hover:bg-primary hover:text-white transition-all transform group-hover:scale-110"
                                    >
                                        {order.user.name?.substring(0, 2).toUpperCase()}
                                    </Link>
                                    <div className="min-w-0 space-y-0.5">
                                        <Link
                                            to="/users/show/$id"
                                            disabled={!hasPermission('users', 'show')}
                                            params={{ id: order.user.id.toString() }}
                                            className="font-black text-sm leading-tight hover:text-primary transition-colors block truncate"
                                        >
                                            {order.user.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground font-medium truncate">{order.user.email}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {order.customer?.id && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-tighter">{t('orders.labels.shopify_id')}: {order.customer.id}</Badge>}
                                            {order.buyer_accepts_marketing && (
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-tighter border-emerald-200 bg-emerald-50 text-emerald-700">
                                                    {t('orders.labels.marketing_opt_in') || 'Marketing'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(order.email || order.phone) && <Separator className="opacity-50" />}
                            <div className="space-y-3">
                                {order.email && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-muted-foreground">{order.email}</span>
                                            {order.contact_email && order.contact_email !== order.email && (
                                                <span className="text-[10px] text-muted-foreground/60 truncate" title={order.contact_email}>
                                                    {t('orders.labels.contact_email') || 'Contact'}: {order.contact_email}
                                                </span>
                                            )}
                                        </div>
                                        <ButtonCopy content={order.email} className="ms-auto h-7 w-7" />
                                    </div>
                                )}
                                {!order.email && order.contact_email && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <span className="truncate text-muted-foreground">{order.contact_email}</span>
                                        <ButtonCopy content={order.contact_email} className="ms-auto h-7 w-7" />
                                    </div>
                                )}
                                {order.phone && (
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <span className="truncate text-muted-foreground" dir="ltr">{order.phone}</span>
                                        <ButtonCopy content={order.phone} className="ms-auto h-7 w-7" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <CardHeader className="pb-2! border-b border-muted/40 ">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Truck className="h-4 w-4" /> {t('orders.labels.shipping_address')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="font-black text-foreground">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                                            <p className="text-muted-foreground font-medium leading-relaxed">
                                                {order.shipping_address.address1}
                                                {order.shipping_address.address2 ? <><br />{order.shipping_address.address2}</> : ''}
                                                <br />
                                                {order.shipping_address.city}{order.shipping_address.province ? `, ${order.shipping_address.province}` : ''}
                                                <br />
                                                {order.shipping_address.country} {order.shipping_address.zip}
                                            </p>
                                        </div>
                                    </div>
                                    {order.shipping_address.phone && (
                                        <div className="flex items-center gap-3 pt-2 pl-7 border-t border-muted/40 mt-3">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-xs font-bold text-muted-foreground" dir="ltr">{order.shipping_address.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Address */}
                    {order.billing_address && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300 opacity-90">
                            <CardHeader className="pb-2! border-b border-muted/40 ">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> {t('orders.labels.billing_address')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-3 opacity-80">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground">{order.billing_address.first_name} {order.billing_address.last_name}</p>
                                            <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                                                {order.billing_address.address1}
                                                <br />
                                                {order.billing_address.city}, {order.billing_address.country}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Shipping Method */}
                    {order.shipping_lines && order.shipping_lines.length > 0 && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                            <CardHeader className="pb-2! border-b border-muted/40">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Truck className="h-4 w-4" /> {t('orders.labels.shipping_method')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                {order.shipping_lines.map((line) => (
                                    <div key={line.id} className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <span className="font-black text-xs uppercase">{line.title}</span>
                                            {line.code && <p className="text-[9px] text-muted-foreground font-mono">{line.code}</p>}
                                        </div>
                                        <span className="font-black tabular-nums flex items-center gap-1.5 text-sm">
                                            {parseFloat(line.price)?.toLocaleString()} <SARIcon className="h-4 w-4" />
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Details Meta */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden">
                        <CardHeader className="pb-2! border-b border-muted/40">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Hash className="h-4 w-4" /> {t('orders.labels.details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-4">
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                        <Hash className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('userShow.shopify_id')}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="font-mono font-black text-xs text-primary">{order.shopify_order_id || order.shopify_id}</p>
                                            <ButtonCopy content={order.shopify_order_id || order.shopify_id || ''} className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                {order.integration_account && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Link2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.store_domain') || 'Store Domain'}</p>
                                            <p className="font-bold text-xs mt-0.5">{order.integration_account.shop_domain}</p>
                                        </div>
                                    </div>
                                )}

                                {(order.payment_gateway || (order.payment_gateway_names && order.payment_gateway_names.length > 0)) && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.payment_gateway') || 'Payment Gateway'}</p>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {order.payment_gateway_names && order.payment_gateway_names.length > 0 ? (
                                                    order.payment_gateway_names.map(gw => (
                                                        <Badge key={gw} variant="secondary" className="text-[10px] py-0 px-1 font-bold capitalize">{gw}</Badge>
                                                    ))
                                                ) : (
                                                    <p className="font-bold text-xs capitalize">{order.payment_gateway}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {order.paid_at && <Separator className="opacity-50" />}

                                {order.paid_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.paid_at')}</p>
                                            <p className="font-bold text-xs mt-0.5">{new Date(order.paid_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {order.fulfilled_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.fulfilled_at')}</p>
                                            <p className="font-bold text-xs mt-0.5">{new Date(order.fulfilled_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {order.closed_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900/20 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.closed_at')}</p>
                                            <p className="font-bold text-xs mt-0.5">{new Date(order.closed_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {order.cancelled_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">{t('orders.labels.cancelled_at')}</p>
                                            <p className="font-bold text-xs mt-0.5">{new Date(order.cancelled_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {order.synced_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.synced_at')}</p>
                                            <p className="font-bold text-xs mt-0.5">{new Date(order.synced_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                {order.processing_method && <Separator className="opacity-50" />}

                                {order.processing_method && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.processing_method') || 'Processing Method'}</p>
                                            <p className="font-bold text-xs mt-0.5 capitalize">{order.processing_method}</p>
                                        </div>
                                    </div>
                                )}

                                {order.cancel_reason && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">{t('orders.labels.cancel_reason') || 'Cancel Reason'}</p>
                                            <p className="font-bold text-xs mt-0.5 text-red-700 dark:text-red-300 capitalize">{order.cancel_reason}</p>
                                        </div>
                                    </div>
                                )}

                                {order.tags && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <div className="w-full">
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.tags')}</p>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {order.tags.split(',').map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 font-bold bg-muted/30">{tag.trim()}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(order.source_name || order.customer_locale || order.checkout_token) && <Separator className="opacity-50" />}

                                {order.source_name && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.source_name')}</p>
                                            <p className="font-bold text-xs mt-0.5 capitalize">{order.source_name}</p>
                                        </div>
                                    </div>
                                )}

                                {order.customer_locale && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.customer_locale')}</p>
                                            <p className="font-bold text-xs mt-0.5 uppercase">{order.customer_locale}</p>
                                        </div>
                                    </div>
                                )}

                                {order.checkout_token && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.checkout_token')}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="font-mono font-bold text-xs max-w-[150px] truncate">{order.checkout_token}</p>
                                                <ButtonCopy content={order.checkout_token} className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(order.confirmation_number || order.total_weight !== undefined || order.referring_site || order.confirmed !== undefined) && <Separator className="opacity-50" />}

                                {order.confirmed !== undefined && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.confirmed')}</p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "mt-0.5 font-bold uppercase text-[9px]",
                                                    order.confirmed ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"
                                                )}
                                            >
                                                {order.confirmed ? t('common.yes') : t('common.no')}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {order.confirmation_number && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.confirmation_number')}</p>
                                            <p className="font-bold text-xs mt-0.5 uppercase">{order.confirmation_number}</p>
                                        </div>
                                    </div>
                                )}

                                {order.total_weight !== undefined && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.weight')}</p>
                                            <p className="font-bold text-xs mt-0.5">{order.total_weight} {t('orders.labels.grams')}</p>
                                        </div>
                                    </div>
                                )}

                                {order.referring_site && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Link2 className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.referring_site')}</p>
                                            <p className="font-bold text-[10px] mt-0.5 truncate max-w-[180px]" title={order.referring_site}>{order.referring_site}</p>
                                        </div>
                                    </div>
                                )}

                                {order.landing_site && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Link2 className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t('orders.labels.landing_site')}</p>
                                            <p className="font-bold text-[10px] mt-0.5 truncate max-w-[180px]" title={order.landing_site}>{order.landing_site}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Status & External Links */}
                    {order.order_status_url && (
                        <Card className="shadow-sm border-primary/20 bg-primary/5 overflow-hidden">
                            <CardContent className="p-4">
                                <Button className="w-full font-black uppercase tracking-tight h-10 shadow-lg shadow-primary/10">
                                    <a href={order.order_status_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 me-2" />
                                        {t('orders.labels.order_status_url')}
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Technical Info */}
                    {(order.browser_ip || (order.client_details && order.client_details.user_agent) || order.checkout_id) && (
                        <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="pb-2! border-b border-muted/40">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Monitor className="h-4 w-4" /> {t('orders.labels.tech_info')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-4">
                                <div className="space-y-4 text-xs">
                                    {order.checkout_id && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                <Hash className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{t('orders.labels.checkout_id')}</p>
                                                <p className="font-mono font-bold text-[10px] mt-0.5">{order.checkout_id}</p>
                                            </div>
                                        </div>
                                    )}

                                    {order.browser_ip && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                <Globe className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{t('orders.labels.ip_address')}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="font-mono font-bold text-[10px]">{order.browser_ip}</p>
                                                    <ButtonCopy content={order.browser_ip} className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.client_details && order.client_details.user_agent && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                <Monitor className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="w-full">
                                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{t('orders.labels.user_agent')}</p>
                                                <p className="font-mono text-[9px] mt-1 p-2 bg-muted/30 rounded border border-muted/50 break-all leading-relaxed" title={order.client_details.user_agent}>
                                                    {order.client_details.user_agent}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.client_details && order.client_details.accept_language && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-7 w-7 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                <Globe className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">{t('orders.labels.accept_language')}</p>
                                                <p className="font-bold text-[10px] mt-0.5 mt-0.5 uppercase">{order.client_details.accept_language}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
