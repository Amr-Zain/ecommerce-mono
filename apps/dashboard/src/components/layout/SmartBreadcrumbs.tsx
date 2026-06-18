import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  Home01Icon,
  Edit01Icon,
  Add01Icon,
  EyeIcon,
  HelpCircleIcon,
  Shield01Icon,
  Building03Icon,
  Flag01Icon,
  Book01Icon,
  UserMultipleIcon,
  ChartAreaIcon,
  ChartColumnStackedIcon,
  ClipboardIcon,
  Award01Icon,
  BalanceScaleIcon,
  PercentIcon,
  Message01Icon,
  Settings01Icon,
  Store01Icon,
  SlidersHorizontalIcon,
  ShoppingCart01Icon,
  DatabaseIcon,
  CreditCardIcon,
  Notification01Icon,
  BarChartIcon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@ecommerce/ui/components/breadcrumb'
import {
  Link,
  type LinkProps,
  type RegisteredRouter,
} from '@tanstack/react-router'

type RouterTo = LinkProps<RegisteredRouter>['to']
type CrudAction = 'add' | 'edit' | 'show' | 'none'

const entityIconMap: Record<string, React.ReactNode> = {
  'menu.home': <HugeiconsIcon icon={Home01Icon} />,
  'menu.products': <HugeiconsIcon icon={DatabaseIcon} />,
  'menu.categories': <HugeiconsIcon icon={ChartColumnStackedIcon} />,
  'menu.attributes': <HugeiconsIcon icon={ClipboardIcon} />,
  'menu.values': <HugeiconsIcon icon={ClipboardIcon} />,
  'menu.orders': <HugeiconsIcon icon={ShoppingCart01Icon} />,
  'menu.reviews': <HugeiconsIcon icon={StarIcon} />,
  'menu.showRooms': <HugeiconsIcon icon={Building03Icon} />,
  'menu.earning_rules': <HugeiconsIcon icon={BalanceScaleIcon} />,
  'menu.rewards': <HugeiconsIcon icon={Award01Icon} />,
  'menu.tiers': <HugeiconsIcon icon={BarChartIcon} />,
  'menu.offers': <HugeiconsIcon icon={PercentIcon} />,
  'menu.coupons': <HugeiconsIcon icon={PercentIcon} />,
  'menu.faqs': <HugeiconsIcon icon={HelpCircleIcon} />,
  'menu.sliders': <HugeiconsIcon icon={SlidersHorizontalIcon} />,
  'menu.static-pages': <HugeiconsIcon icon={Book01Icon} />,
  'menu.roles': <HugeiconsIcon icon={Shield01Icon} />,
  'menu.supervisors': <HugeiconsIcon icon={UserMultipleIcon} />,
  'menu.users': <HugeiconsIcon icon={UserMultipleIcon} />,
  'menu.cities': <HugeiconsIcon icon={Building03Icon} />,
  'menu.countries': <HugeiconsIcon icon={Flag01Icon} />,
  'menu.smsProviders': <HugeiconsIcon icon={Message01Icon} />,
  'menu.smsSessions': <HugeiconsIcon icon={Message01Icon} />,
  'menu.paymentGateways': <HugeiconsIcon icon={CreditCardIcon} />,
  'menu.paymentSessions': <HugeiconsIcon icon={CreditCardIcon} />,
  'menu.admin_notifications': <HugeiconsIcon icon={Notification01Icon} />,
  'menu.notifications': <HugeiconsIcon icon={Notification01Icon} />,
  'menu.tickets': <HugeiconsIcon icon={Message01Icon} />,
  'menu.shopifyStores': <HugeiconsIcon icon={Store01Icon} />,
  'menu.profile': <HugeiconsIcon icon={UserMultipleIcon} />,
  'menu.analytics': <HugeiconsIcon icon={ChartAreaIcon} />,
  'settings.general': <HugeiconsIcon icon={Settings01Icon} />,
}

const actionPresets: Record<
  Exclude<CrudAction, 'none'>,
  { key: string; icon: React.ReactNode }
> = {
  add: { key: 'buttons.add', icon: <HugeiconsIcon icon={Add01Icon} /> },
  edit: { key: 'buttons.edit', icon: <HugeiconsIcon icon={Edit01Icon} /> },
  show: { key: 'buttons.show', icon: <HugeiconsIcon icon={EyeIcon} /> },
}

type BuiltCrumb = {
  label: React.ReactNode
  to?: RouterTo
  icon?: React.ReactNode
}

export function SmartBreadcrumbs(props: {
  entityKey?: string
  entityTo?: RouterTo
  action?: CrudAction
  includeHome?: boolean
  entityIconOverride?: React.ReactNode
  extra?: BuiltCrumb[]
  className?: string
}) {
  const { t } = useTranslation()
  const {
    entityKey,
    entityTo,
    action = 'none',
    includeHome = true,
    entityIconOverride,
    extra = [],
    className,
  } = props

  const base: BuiltCrumb[] = [
    ...(includeHome
      ? [
          {
            label: t('menu.home'),
            to: '/' as const,
            icon: entityIconMap['menu.home'] ?? (
              <HugeiconsIcon icon={Home01Icon} />
            ),
          },
        ]
      : []),
    ...(!!entityKey
      ? [
          {
            label: t(entityKey),
            to: entityTo,
            icon: entityIconOverride ?? entityIconMap[entityKey],
          },
        ]
      : []),
  ]

  // optional Action crumb
  const actionCrumbs: BuiltCrumb[] =
    action !== 'none'
      ? [
          {
            label: t(actionPresets[action].key),
            icon: actionPresets[action].icon,
          },
        ]
      : []

  // final list (no slice!)
  const finalCrumbs = [...base, ...extra, ...actionCrumbs]

  return (
    <Breadcrumb>
      <BreadcrumbList className={['mb-4', className].filter(Boolean).join(' ')}>
        {finalCrumbs.map((item, index) => {
          const isLast = index === finalCrumbs.length - 1
          const { to, label, icon } = item
          const key =
            (typeof label === 'string' ? label : `bc-${index}`) + `-${index}`

          return (
            <React.Fragment key={to ?? key}>
              <BreadcrumbItem className="flex items-center">
                {to ? (
                  <BreadcrumbLink className="page-title inline-flex items-center gap-1">
                    <Link
                      to={to}
                      className="inline-flex items-center gap-1 text-nowrap"
                    >
                      {icon} {label}
                    </Link>
                  </BreadcrumbLink>
                ) : isLast ? (
                  <BreadcrumbPage className="page-title text-muted-foreground inline-flex items-center gap-1 text-nowrap">
                    {icon} {label}
                  </BreadcrumbPage>
                ) : (
                  <span className="page-title inline-flex items-center gap-1 text-nowrap">
                    {icon} {label}
                  </span>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator aria-hidden="true" className="mx-2">
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-5 rtl:rotate-180"
                  />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
