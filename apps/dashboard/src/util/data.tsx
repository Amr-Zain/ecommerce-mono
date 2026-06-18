import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement, HugeiconsIconProps } from '@hugeicons/react'
import {
  Award01Icon,
  BarChartIcon,
  Notification01Icon,
  Book01Icon,
  Building03Icon,
  ChartColumnStackedIcon,
  ClipboardIcon,
  CreditCardIcon,
  DatabaseIcon,
  Flag01Icon,
  HelpCircleIcon,
  Home01Icon,
  Message01Icon,
  PercentIcon,
  BalanceScaleIcon,
  Settings01Icon,
  Shield01Icon,
  ShoppingCart01Icon,
  SlidersHorizontalIcon,
  Store01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { MenuItem } from '@/types/components/sidebar'

const H = (icon: IconSvgElement) => {
  const Comp = (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={icon} {...props} />
  )
  return Comp
}
const Award = H(Award01Icon)
const BarChart3 = H(BarChartIcon)
const Bell = H(Notification01Icon)
const Book = H(Book01Icon)
const Building2 = H(Building03Icon)
const CreditCard = H(CreditCardIcon)
const Database = H(DatabaseIcon)
const Flag = H(Flag01Icon)
const HelpCircle = H(HelpCircleIcon)
const Home = H(Home01Icon)
const MessageSquare = H(Message01Icon)
const Percent = H(PercentIcon)
const Scale = H(BalanceScaleIcon)
const Settings = H(Settings01Icon)
const Shield = H(Shield01Icon)
const ShoppingCart = H(ShoppingCart01Icon)
const Sliders = H(SlidersHorizontalIcon)
const Store = H(Store01Icon)
const Users2 = H(UserMultipleIcon)

export const getDashboardMenuItems: MenuItem[] = [
  // {
  //   title: 'menu.overview',
  //   url: '/',
  //   icon: Home,
  // },
  // {
  //   title: 'menu.analytics',
  //   url: '/analytics',
  //   icon: BarChart3,
  //   // badge: 'Pro',
  //   /*     permission: 'statistics.index'
  //    */
  // },

  {
    title: 'menu.static-pages',
    url: '/static-pages',
    icon: Book,
    checkPermission: true,
  },
  {
    title: 'menu.sliders',
    url: '/sliders',
    icon: Sliders,
    checkPermission: true,
  },
  // {
  //   title: 'menu.offers',
  //   url: '/offers',
  //   icon: Percent,
  // },

  {
    title: 'menu.faqs',
    url: '/faqs',
    icon: HelpCircle,
    checkPermission: true,
  },
]
export const getProductsAndShowRoomsMenuItems: MenuItem[] = [
  {
    title: 'menu.products',
    url: '/products',
    icon: Database,
    checkPermission: true,
    subItems: [
      {
        title: 'menu.categories',
        url: '/categories',
        checkPermission: true,
        permissionEntity: 'collections',
      },
      {
        title: 'menu.attributes',
        url: '/attributes',
        checkPermission: true,
      },
      {
        title: 'menu.products',
        url: '/products',
        checkPermission: true,
      },
      {
        title: 'menu.reviews',
        url: '/reviews',
        // icon: MessageSquare,
        checkPermission: true,
      },
      /* {
        title: 'menu.categories',
        url: '/products/categories',
      },
      { title: 'menu.inventory', url: '/products/inventory' }, */
    ],
  },
  {
    title: 'menu.orders',
    url: '/orders',
    icon: ShoppingCart,
    // badge: '23',
    checkPermission: true,
  },
  {
    title: 'menu.returns',
    url: '/returns',
    icon: ShoppingCart,
    checkPermission: true,
  },
  {
    title: 'menu.tickets',
    url: '/tickets',
    icon: MessageSquare,
    checkPermission: true,
  },
  {
    title: 'menu.exchanges',
    url: '/exchanges',
    icon: ShoppingCart,
    checkPermission: true,
  },
  {
    title: 'menu.coupons',
    url: '/coupons',
    icon: Percent,
    checkPermission: true,
  },
  {
    title: 'menu.show-rooms',
    url: '/show-rooms',
    icon: Building2,
    //badge: 'Pro',
    /*     permission: 'users.index'
     */
    checkPermission: true,
  },
]
export const getEarningMenuItems: MenuItem[] = [
  {
    title: 'menu.earning_rules',
    url: '/earning-rules',
    icon: Scale,
    checkPermission: true,
  },
  {
    title: 'menu.rewards',
    url: '/rewards',
    icon: Award,
    checkPermission: true,
  },
  {
    title: 'menu.tiers',
    url: '/tiers',
    icon: BarChart3,
    checkPermission: true,
  },
]
/* export const getToolsMenuItems : MenuItem[] = [
  {
    title: 'menu.calendar',
    url: '/calendar',
    icon: Calendar,
  },
  {
    title: 'menu.messages',
    url: '/messages',
    icon: Mail,
    badge: '3',
  },
  {
    title: 'menu.fileManager',
    url: '/files',
    icon: FolderOpen,
  },
  {
    title: 'menu.search',
    url: '/search',
    icon: Search,
  },
] */
export const getSettingsMenuItems: any = (not_count?: number) => [
  {
    title: 'menu.message_templates',
    url: '/message-templates',
    icon: MessageSquare,
    checkPermission: true,
    permissionEntity: 'message_templates',
  },
  {
    title: 'menu.send_message',
    url: '/messages/send',
    icon: MessageSquare,
    checkPermission: true,
    permissionEntity: 'messages',
  },
  {
    title: 'menu.message_campaigns',
    url: '/messages',
    icon: MessageSquare,
    checkPermission: true,
    permissionEntity: 'messages',
  },
  {
    title: 'menu.admin_notifications',
    url: '/admin-notifications',
    icon: Bell,
    checkPermission: true,
  },
  {
    title: 'menu.notifications',
    url: '/settings/notifications',
    icon: Bell,
    checkPermission: false,
    badge: not_count,
  },
  {
    title: 'menu.settings',
    url: '/settings/general',
    icon: Settings,
    checkPermission: true,
  },
  {
    title: 'menu.ThirdParty',
    url: '/payment-gateways',
    icon: CreditCard,
    checkPermission: true,
    subItems: [
      {
        title: 'menu.payment-gateways',
        url: '/payment-gateways',
        checkPermission: true,
      },
      {
        title: 'menu.sms-providers',
        url: '/sms-providers',
        checkPermission: true,
      },
      {
        title: 'menu.shopify-stores',
        url: '/settings/shopify-stores',
        // icon: Store,
        checkPermission: true,
      },
    ],
  },
  // {
  //   title: 'menu.cities',
  //   url: '/settings/cities',
  //   icon: Building2,
  //   checkPermission: true,
  // },
  {
    title: 'menu.countries',
    url: '/settings/countries',
    icon: Flag,
    checkPermission: true,
  },

  /*  {
    title: 'menu.billing') || 'Billing',
    url: '/billing',
    icon: CreditCard,
  }, */
  /*  {
    title: 'menu.helpSupport') || 'Help & Support',
    url: '/help',
    icon: HelpCircle,
  }, */
]
export const usersMenuItems: MenuItem[] = [
  {
    title: 'menu.roles',
    url: '/roles',
    icon: Shield,
    //badge: 'Pro',
    /*     permission: 'users.index'
     */
    checkPermission: true,
  },
  {
    title: 'menu.supervisors',
    url: '/supervisors',
    icon: Users2,
    //badge: 'Pro',
    /*     permission: 'users.index'
     */
    checkPermission: true,
  },
  {
    title: 'menu.users',
    url: '/users',
    icon: Users2,
    checkPermission: true,
    permissionEntity: 'clients',
  },
]
