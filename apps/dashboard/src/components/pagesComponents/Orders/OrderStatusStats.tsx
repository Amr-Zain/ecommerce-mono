import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PackageCheck,
  RotateCcw,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader } from '@ecommerce/ui/components/card'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import type { LucideIcon } from 'lucide-react'
import type { ApiResponseBase } from '@/types/api/http'
import type { DashboardStatistics } from '@/types/api/dashboard'
import { StatsCard } from '@/components/common/charts/StatsCard'
import useFetch from '@/hooks/UseFetch'
import { ORDER_STATUSES } from '@/types/api/order'
import { queryKeys } from '@/util/queryKeysFactory'

const statusConfig: Record<string, { icon: LucideIcon; color: string }> = {
  [ORDER_STATUSES.pending]: {
    icon: AlertCircle,
    color: 'text-amber-500 bg-amber-500/10',
  },
  [ORDER_STATUSES.processing]: {
    icon: Clock,
    color: 'text-blue-600 bg-blue-500/10',
  },
  [ORDER_STATUSES.shipped]: {
    icon: Truck,
    color: 'text-blue-600 bg-blue-500/10',
  },
  [ORDER_STATUSES.delivered]: {
    icon: PackageCheck,
    color: 'text-emerald-600 bg-emerald-500/10',
  },
  [ORDER_STATUSES.cancelled]: {
    icon: XCircle,
    color: 'text-red-500 bg-red-500/10',
  },
  [ORDER_STATUSES.refunded]: {
    icon: RotateCcw,
    color: 'text-purple-600 bg-purple-500/10',
  },
  open: { icon: Clock, color: 'text-blue-600 bg-blue-500/10' },
  closed: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
}

export function OrderStatusStats() {
  const { t } = useTranslation()
  const { data: statsResponse } = useFetch<
    ApiResponseBase<DashboardStatistics>
  >({
    queryKey: queryKeys.dashboard.section('sales'),
    endpoint: 'dashboard/sections/sales',
    suspense: true,
  })

  const data = statsResponse.data
  const statuses = Object.entries(data.orders.by_status).filter(
    ([name]) => name !== 'null' && name !== 'undefined',
  )

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6"
    >
      <StatsCard
        title={t('dashboard.totalOrders')}
        value={data.orders.total}
        change={`+${data.orders.orders_this_month} ${t('dashboard.thisMonth')}`}
        changeType="increase"
        icon={ShoppingCart}
        iconColor="text-indigo-600 bg-indigo-500/10"
      />

      {statuses.map(([name, count]) => {
        const config = statusConfig[name] ?? {
          icon: ShoppingCart,
          color: 'text-primary bg-primary/10',
        }
        return (
          <StatsCard
            key={name}
            title={statusLabel(name, t)}
            value={count}
            icon={config.icon}
            iconColor={config.color}
          />
        )
      })}
    </motion.div>
  )
}

export function OrderStatusStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function statusLabel(status: string, t: (key: string) => string) {
  const key = `orders.status.${status}`
  const translated = t(key)
  if (translated !== key) return translated
  return status.replaceAll('_', ' ')
}
