/* eslint-disable import/order, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unnecessary-type-assertion */
import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Button } from '@ecommerce/ui/components/button'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  Add01Icon,
  ArrowRight01Icon,
  Edit01Icon,
  EyeIcon,
  HeartAddIcon,
  LayoutGridIcon,
  Package01Icon,
  ShoppingCart01Icon,
  StarIcon as StarIconSvg,
  Time01Icon,
  TrendingUpDownIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon  } from '@hugeicons/react'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { Progress } from '@ecommerce/ui/components/progress'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import { LocalizedContentCard } from '../../StaticPages/show/LocalizedContentCard'
import ProductVariationFormDialog from '../VariationsForm'
import { ProductVariationsCard } from './ProductVariationsCard'
import type { Product, ProductStatistics, ProductVariation } from '@/types/api/product'
import { formatDate } from '@/util/helpers'

import { ProductReviewsCard } from './ProductReviewsCard'
import { ProductStatisticsTab } from './ProductStatisticsTab'
import { SARIcon } from '@/components/common/Icons'

import { StatsCard } from '@/components/common/charts/StatsCard'
import { HasPermission } from '@/components/common/HasPermission'
import type {HugeiconsIconProps} from '@hugeicons/react';
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import { ShowHeader } from '@/components/common/show'

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
  <HugeiconsIcon icon={icon} {...props} />
)
const ShoppingCart = H(ShoppingCart01Icon)
const TrendingUp = H(TrendingUpDownIcon)
const Eye = H(EyeIcon)
const Package = H(Package01Icon)
const StarIcon = H(StarIconSvg)
const Heart = H(HeartAddIcon)
const LayoutDashboard = H(LayoutGridIcon)
const History = H(Time01Icon)
const ArrowRight = H(ArrowRight01Icon)
const Plus = H(Add01Icon)
const Edit = H(Edit01Icon)

type Props = {
  product: Product
}

function getDiscountBadge(discount: Product['discount']) {
  if (!discount) return ''
  return discount.type === 'percentage'
    ? `-${discount.value}%`
    : `-${discount.value}`
}

export function ProductShow({ product }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search: any = useSearch({ strict: false })
  const activeTab = search.tab || 'details'

  const setActiveTab = (tab: string) => {
    navigate({
      to: '.',
      search: (prev: any) => ({ ...prev, tab }),
      replace: true,
    })
  }

  const discountBadge = getDiscountBadge(product.discount)
  const priceRange =
    product.price_range && product.price_range.min !== product.price_range.max
      ? `${product.price_range.min.toFixed(2)} - ${product.price_range.max.toFixed(2)}`
      : product.price?.toFixed(2)
  const defaultVariant = product.variants?.find((variant) => variant.is_default)

  // Dialog state for create/edit variation
  const [variationFormOpen, setVariationFormOpen] = React.useState(false)
  const [selectedVariation, setSelectedVariation] =
    React.useState<ProductVariation | null>(null)

  const openCreateVariation = React.useCallback(() => {
    setSelectedVariation(null)
    setVariationFormOpen(true)
  }, [])

  const openEditVariation = React.useCallback((v: ProductVariation) => {
    setSelectedVariation(v)
    setVariationFormOpen(true)
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-4">
      <ShowHeader
        variant="card"
        image={product.image?.url ? { src: product.image.url, alt: product.en?.name ?? product.name ?? 'Product' } : null}
        title={product.en?.name ?? product.name ?? '—'}
        secondaryTitle={product.ar?.name ?? '—'}
        id={product.id}
        createdAt={product.created_at}
        meta={<span>SKU {product.sku}</span>}
        badges={[
          { variant: product.is_active ? 'default' : 'secondary', children: product.is_active ? t('status.active') : t('status.inactive') },
          ...(product.is_featured ? [{ children: t('status.featured') }] : []),
          ...(product.discount && product.discount.value > 0 ? [{ variant: 'destructive' as const, className: 'animate-pulse', children: product.discount.type === 'percentage' ? `-${product.discount.value}%` : `-${product.discount.value}` }] : []),
        ]}
        preHeader={
          <HasPermission entity="products" action="update">
            <div className="flex justify-end">
              <Link to={'/products/edit/$id'} params={{ id: String(product.id) }}>
                <Button size="sm" className="gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  {t('actions.update', { entity: t('common.product') })}
                </Button>
              </Link>
            </div>
          </HasPermission>
        }
        actions={
          <>
            <span className="text-xs text-muted-foreground">
              {t('menu.products')} • {product.collection?.name ?? '—'}
            </span>
            {product.shopify_id && <div className='flex items-center gap-1'>
              <div className='text-sm font-medium'>
                {t('userShow.shopify_id')}: {product.shopify_id || "unregistered"}
              </div>
              <ButtonCopy content={product.shopify_id || ''} className='h-6 w-6' />
            </div>}
          </>
        }
      />
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <AnimatedTabs
        value={activeTab}
        onValueChange={setActiveTab}
        tabsListClassName="bg-muted/50 border relative !h-14 p-1 gap-1"
        contentClassName="mt-4"
        items={[
          {
            value: 'details',
            className: 'relative px-6 h-10 flex-1 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none group',
            trigger: (
              <>
                <LayoutDashboard className="h-4 w-4 relative z-10" />
                <span className="relative z-10 font-bold">{t('productShow.tabs.details')}</span>
              </>
            ),
            content: (
              <div className="space-y-8">
                {/* Pricing + Meta */}
                <Card className="shadow-none border-muted/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t('productShow.pricing.title', 'Variant pricing and stock')}</span>
                      <Badge variant="outline" className="font-mono text-[10px]">{product.barcode}</Badge>
                    </CardTitle>
                    <CardDescription>{t('productShow.pricing.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-muted/50">
                      <div className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        {t('table.price', 'Price')}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-3xl font-black flex items-center gap-1 text-primary">
                          {priceRange}
                          <SARIcon className="h-6 w-6 opacity-70" />
                        </div>
                        {product.discount && product.discount.value > 0 && (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                {product.price.toFixed(2)}
                              </span>
                              <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-bold animate-in fade-in zoom-in duration-300">
                                {discountBadge}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-destructive font-bold uppercase tracking-wider">
                              {t('productShow.youSave')}: {(product.discount?.amount || 0).toFixed(2)} <SARIcon className="inline size-2.5" />
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('productShow.variations.default', 'Default variant')}
                      </div>
                      <div className="text-sm font-medium">{defaultVariant?.sku || product.sku || '—'}</div>
                      <div className="text-[11px] text-muted-foreground">
                        #{defaultVariant?.id ?? product.default_variant_id ?? product.representative_variant_id ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('table.columns.stock')}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{product.stock}</span>
                        <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-[9px] h-4">
                          {product.stock > 0 ? t('productShow.inStock') : t('status.inactive')}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {t('productShow.reserved')}: {product.reserved ?? 0} • {t('productShow.onHand', 'On hand')}: {product.on_hand_stock ?? product.stock}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('Form.labels.tags')}</div>
                      <div className="flex flex-wrap gap-1">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 h-4">{tag}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <LocalizedContentCard
                  titleI18nKey="productShow.localized.title"
                  subtitleI18nKey="productShow.localized.subtitle"
                  en={{ title: product.en?.name ?? product.name, content: product.en?.description ?? product.description }}
                  ar={{ title: product.ar?.name, content: product.ar?.description }}
                />

                <Card className="shadow-none border-muted/60">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t('productShow.gallery.title')}</span>
                    </CardTitle>
                    <CardDescription>{t('productShow.gallery.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {product.image ? (
                        <a href={product.image.path} target="_blank" rel="noreferrer" className="md:col-span-1 border rounded-xl overflow-hidden group relative">
                          <img src={product.image.path} alt={product.en?.name ?? product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <Eye className="text-white h-8 w-8" />
                          </div>
                        </a>
                      ) : null}
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        {product?.gallery?.map((img, i) => (
                          <a key={i} href={img.path} target="_blank" rel="noreferrer" className='border rounded-xl overflow-hidden group relative h-48'>
                            <img src={img.path} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Eye className="text-white h-6 w-6" />
                            </div>
                          </a>
                        ))}
                        {(product.gallery?.length || []) === 0 && (
                          <div className="text-sm text-muted-foreground col-span-2 py-8 text-center bg-muted/20 rounded-xl border border-dashed">
                            {t('Text.noResults')}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ProductVariationsCard
                  variations={product.variants ?? []}
                  productDiscountType={product.discount_type}
                  productDiscountValue={product.discount_value}
                  onCreate={openCreateVariation}
                  onEdit={openEditVariation}
                />
                <ProductReviewsCard productId={product.id} />
              </div>
            ),
          },
          {
            value: 'statistics',
            className: 'relative px-6 h-10 flex-1 py-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none group',
            trigger: (
              <>
                <TrendingUp className="h-4 w-4 relative z-10" />
                <span className="relative z-10 font-bold">{t('productShow.tabs.statistics')}</span>
              </>
            ),
            content: (
              <div className="space-y-8">
                <ProductStatisticsTab productId={product.id} />
                {product.statistics && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <StatsCard title={t('productShow.stats.totalSold')} value={product.statistics.sales.total_sold}
                        subItems={[{ label: t('productShow.stats.totalRevenue'), value: product.statistics.sales.total_revenue }, { label: t('productShow.stats.avgOrderQty'), value: product.statistics.sales.average_order_qty }, { label: t('productShow.stats.conversion'), value: `${product.statistics.engagement.conversion_rate}%` }]}
                        change={`${product.statistics.sales.sales_trend}%`} changeType={product.statistics.sales.sales_trend >= 0 ? 'increase' : 'decrease'}
                        icon={ShoppingCart} iconColor="text-blue-600 bg-blue-500/10" />
                      <StatsCard title={t('productShow.stats.views')} value={product.statistics.engagement.views_count}
                        subItems={[{ label: t('productShow.stats.wishlist'), value: product.statistics.engagement.wishlist_count }, { label: t('productShow.stats.cartAdditions'), value: product.statistics.engagement.cart_additions }]}
                        icon={Eye} iconColor="text-indigo-600 bg-indigo-500/10" />
                      <StatsCard title={t('productShow.stats.available')} value={product.statistics.inventory.available_stock}
                        subItems={[{ label: t('productShow.stats.stockValue'), value: product.statistics.inventory.stock_value }, { label: t('productShow.variations.title'), value: product.statistics.variations.total_count }]}
                        icon={Package} iconColor="text-emerald-600 bg-emerald-500/10" />
                      <StatsCard title={t('productShow.reviews')} value={`${product.statistics.reviews.average_rating} / 5`}
                        subItems={[{ label: t('productShow.totalReviews'), value: product.statistics.reviews.total_count }, { label: t('dashboard.pendingApproval'), value: product.statistics.reviews.pending_count }]}
                        icon={StarIcon} iconColor="text-yellow-500 bg-yellow-500/10" />
                    </div>
                  </div>
                )}
                {product.recent_activity && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="shadow-none border-muted/60">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary" />{t('productShow.activity.orders')}</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs"><Link to={"/orders" as any}>{t('actions.viewAll')}<ArrowRight className="h-3 w-3 rtl:rotate-180" /></Link></Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {product.recent_activity?.orders?.map((order) => (
                            <Link key={order.id} to={`/orders/show/${order.id}` as any} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer group">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><ShoppingCart className="h-3.5 w-3.5" /></div>
                                <div><p className="text-sm font-semibold">#{order.order_number}</p><p className="text-[10px] text-muted-foreground">{order.created_at}</p></div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-bold">{order.total} <SARIcon className="inline size-3 mb-0.5 opacity-60" /></p>
                                <Badge variant={order.status === 'open' ? 'default' : 'secondary'} className="capitalize text-[10px] px-2 h-5">{order.status}</Badge>
                              </div>
                            </Link>
                          ))}
                          {!product.recent_activity.orders?.length && <p className="text-sm text-muted-foreground py-4 text-center">{t('Text.noResults')}</p>}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-6">
                      <Card className="shadow-none border-muted/60">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-base flex items-center gap-2"><StarIcon className="h-4 w-4 text-warning fill-warning" />{t('productShow.activity.reviews')}</CardTitle>
                          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs"><Link to={"/reviews"} search={{ 'filters[product_id]': product.id } as any}>{t('actions.viewAll')}<ArrowRight className="h-3 w-3 rtl:rotate-180" /></Link></Button>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {product.statistics?.reviews?.rating_distribution && (
                              <div className="py-2 space-y-2.5 mb-2 border-b border-muted/30">
                                {[5, 4, 3, 2, 1].map((star) => {
                                  const starKey = `${star}_star` as keyof ProductStatistics['reviews']['rating_distribution']
                                  const count = product.statistics!.reviews.rating_distribution[starKey] || 0
                                  const distValues = Object.values(product.statistics!.reviews.rating_distribution)
                                  const totalInDistribution = distValues.reduce((acc, curr) => acc + curr, 0) || 1
                                  const percentage = (count / totalInDistribution) * 100
                                  return (
                                    <div key={star} className="grid grid-cols-[30px_1fr_40px] items-center gap-4">
                                      <span className="text-[10px] font-black text-muted-foreground/70 text-right">{star}★</span>
                                      <Progress value={percentage} className="h-2 bg-muted/40 [&_[data-slot=progress-indicator]]:bg-yellow-400" />
                                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground text-start">{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            {product.recent_activity?.reviews?.map((review) => (
                              <Link key={review.id} to={`/reviews/show/${review.id}` as any} className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group border border-transparent hover:border-muted">
                                <div className="relative shrink-0">
                                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-warning/30 transition-colors">
                                    <AvatarFallback className="bg-warning/10 text-warning font-black text-xs">{review.rating}★</AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border flex items-center justify-center shadow-sm"><StarIcon className="h-2 w-2 fill-warning text-warning" /></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between"><p className="text-xs font-bold truncate">{review.user_name}</p><span className="text-[9px] text-muted-foreground">{review.created_at?.split(' ')[0]}</span></div>
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{review.comment || (<i>{t('productShow.noReviews')}</i>)}</p>
                                </div>
                              </Link>
                            ))}
                            {!product.recent_activity.reviews?.length && <p className="text-sm text-muted-foreground py-2 text-center">{t('Text.noResults')}</p>}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-muted/60">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-pink-500 fill-pink-500" />{t('productShow.activity.wishlists')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {product.recent_activity?.wishlists?.map((w) => (
                              <Badge key={w.id} variant="secondary" className="px-3 py-1 bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100 cursor-pointer">
                                <Link to={`/users/show/$id`} params={{ id: w.id?.toString() }}>{w.user_name}</Link>
                              </Badge>
                            ))}
                            {!product.recent_activity.wishlists?.length && <p className="text-sm text-muted-foreground w-full text-center">{t('Text.noResults')}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      <CardFooter className="flex items-center justify-end text-sm text-muted-foreground">
        {t('table.updatedAt')}: &nbsp; {formatDate(product.created_at)}
      </CardFooter>

      {/* Variations Dialog */}
      <ProductVariationFormDialog
        productId={product.id}
        isOpen={variationFormOpen}
        onClose={() => setVariationFormOpen(false)}
        variation={selectedVariation ?? undefined}
      />
    </div>
  )
}

export default ProductShow
