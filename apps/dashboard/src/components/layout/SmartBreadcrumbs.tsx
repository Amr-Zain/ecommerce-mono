import * as React from 'react'
import {
  ChevronsRight,
  Home as HomeIcon,
  Edit,
  Plus,
  Eye,
  HelpCircle,
  Shield,
  Building2,
  Flag,
  Book,
  UsersRound,
  ChartAreaIcon,
  ChartColumnStacked,
  ClipboardList,
  ContactRound,
  Award,
  Scale,
  Percent,
  MessageSquare,
  Settings,
  Store,
  Sliders,
  ShoppingCart,
} from 'lucide-react'
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
  'menu.categories': <ChartColumnStacked />,
  'menu.home': <HomeIcon />,
  'menu.faqs': <HelpCircle />,
  'menu.roles': <Shield />,
  'menu.cities': <Building2 />,
  'menu.countries': <Flag />,
  'menu.showRooms': <Building2 />,
  'menu.static-pages': <Book />,
  'menu.supervisors': <UsersRound />,
  'menu.sliders': <Sliders />,
  'menu.analytics': <ChartAreaIcon />,
  'menu.attributes': <ClipboardList />,
  'menu.values': <ClipboardList />,
  'menu.orders': <ShoppingCart />,
  'menu.profile': <ShoppingCart />,
  'menu.earning_rules': <Scale />,
  'menu.offers': <Percent />,
  'menu.sms-providers': <MessageSquare />,
  'settings.general': <Settings />,
  'menu.shopify-stores': <Store />,
}

const actionPresets: Record<
  Exclude<CrudAction, 'none'>,
  { key: string; icon: React.ReactNode }
> = {
  add: { key: 'buttons.add', icon: <Plus /> },
  edit: { key: 'buttons.edit', icon: <Edit /> },
  show: { key: 'buttons.show', icon: <Eye /> },
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
          icon: entityIconMap['menu.home'] ?? <HomeIcon />,
        },
      ]
      : []),
    ...(!!entityKey ? [{
      label: t(entityKey),
      to: entityTo,
      icon: entityIconOverride ?? entityIconMap[entityKey],
    }] : []),
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
                  <BreadcrumbLink

                    className="page-title inline-flex items-center gap-1"
                  >
                    <Link to={to}>
                      {icon} {label}
                    </Link>
                  </BreadcrumbLink>
                ) : isLast ? (
                  <BreadcrumbPage className="page-title text-muted-foreground inline-flex items-center gap-1">
                    {icon} {label}
                  </BreadcrumbPage>
                ) : (
                  <span className="page-title inline-flex items-center gap-1">
                    {icon} {label}
                  </span>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator aria-hidden="true" className="mx-2">
                  <ChevronsRight className="size-5 rtl:rotate-180" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
