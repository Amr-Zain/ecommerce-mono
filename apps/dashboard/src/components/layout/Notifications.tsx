'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback } from '@ecommerce/ui/components/avatar'
import { Button } from '@ecommerce/ui/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@ecommerce/ui/components/popover'
import { Separator } from '@ecommerce/ui/components/separator'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'
import { ApiResponseBase } from '@/types/api/http'
import { Notification, NotificationsResponse } from '@/routes/_main/settings/notifications'
import { ScrollArea } from '@ecommerce/ui/components/scroll-area'
import { queryClient } from '@/components/providers/tabstackQueryProvider'
import axiosInstance from '@/services/instance'
import { toast } from 'sonner'
import { i18n as I18nType } from 'i18next'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { useNotificationStream } from '@/hooks/useNotificationStream'
import { API_BASE_URL } from '@/lib/env'

const NotificationItemContent = ({ item, i18n }: { item: Notification, i18n: I18nType }) => (
  <>
    <div className="relative mt-1 shrink-0">
      <Avatar className='h-9 w-9 rounded-lg ring-1 ring-border group-hover:ring-primary/30 transition-all'>
        <AvatarFallback className='bg-primary/10 text-primary text-[10px] font-bold'>
          {(item.additional_data?.actor_name || item.additional_data?.notification_type || item.type || 'N')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {!item.is_read && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
      )}
    </div>

    <div className='max-w-[280px] flex flex-col gap-0.5 grow-1 '>
      <div className='flex items-center justify-between gap-2'>
        <p className={`text-xs font-bold truncate ${!item.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
          {item.title}
        </p>
        <span className='text-[10px] text-muted-foreground whitespace-nowrap opacity-60 font-medium'>
          {item.created_at}
        </span>
      </div>
      <p className='text-[11px] text-muted-foreground line-clamp-2 leading-snug'>
        {item.body}
      </p>
    </div>
  </>
)

const PopoverNotifications = () => {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { data: user } = useDashboardProfile()
  const userType = user?.user_type

  useNotificationStream(!!userType)

  const { data, isLoading } = useFetch<ApiResponseBase<NotificationsResponse>>({
    endpoint: 'notifications',
    queryKey: queryKeys.notifications.list({ per_page: 5 }),
    params: { per_page: 5 },
  })

  const notifications = data?.data?.[`${userType}_notifications`]?.data || []
  const unreadCount = data?.data?.unread_notifications_count || 0

  const getNotificationLink = (item: Notification) => {
    const type = (item.additional_data?.notification_type || item.type || '').toLowerCase()
    const targetId = item.notify_id ||
      item.additional_data?.order_id ||
      item.additional_data?.user_id ||
      item.additional_data?.product_id ||
      item.additional_data?.id

    if (!targetId) return null

    if (type.includes('order')) return `/orders/show/${targetId}`
    if (type.includes('user') || type.includes('tier_upgrade')) return `/users/show/${targetId}`
    if (type.includes('product')) return `/products/show/${targetId}`
    if (type.includes('review')) return `/reviews/show/${targetId}`
    if (type.includes('contact')) return `/messages`

    return null
  }

  const handleNotificationClick = (item: Notification) => {
    const link = getNotificationLink(item)

    if (!item.is_read) {
      handleMarkAsRead(item.id)
    }

    if (link) {
      navigate({ to: link as any })
    }

    setIsOpen(false)
  }

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await axiosInstance.get(`${API_BASE_URL}/notifications/${id}`)
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    } catch (err: any) {
      toast.error(err.message || t('errors.somethingWentWrong'))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button variant='ghost' className='relative h-12 w-12 rounded-full hover:bg-accent/50 transition-all active:scale-95 flex items-center justify-center p-0'>
          <HugeiconsIcon icon={Notification01Icon} className="h-8 w-8" />
          {unreadCount > 0 && (
            <span className='absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white ring-2 ring-background ring-offset-0 transition-all animate-bounce-subtle'>
              {unreadCount}
            </span>
          )}
          <span className='sr-only'>{t('menu.notifications')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-85 p-0 overflow-hidden rounded-xl border-muted/60 shadow-xl' align="end">
        <div className='flex flex-col'>
          <div className='flex items-center justify-between gap-2 px-4 py-3 bg-muted/30'>
            <span className='font-bold text-sm tracking-tight'>{t('menu.notifications')}</span>
            <Link
              to="/settings/notifications"
              search={{} as any}
              onClick={() => setIsOpen(false)}
            >
              <Button variant="ghost" className="text-xs h-7 px-2 font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                {t('dashboard.viewAll')}
              </Button>
            </Link>
          </div>
          <Separator />

          <ScrollArea className="h-[380px] pe-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-20 py-10">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              </div>
            ) : notifications.length > 0 ? (
              <ul className='grid'>
                {notifications.map((item) => {
                  return (
                    <li
                      key={item.id}
                      className={`group flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer border-b border-muted/40 last:border-0 ${!item.is_read ? 'bg-primary/5' : ''}`}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div className="flex gap-3 w-full">
                        <NotificationItemContent item={item} i18n={i18n} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <HugeiconsIcon icon={Notification01Icon} className="h-8 w-8 text-muted-foreground opacity-30" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground/80">{t('common.no_notifications')}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{t('common.no_notifications_desc')}</p>
              </div>
            )}
          </ScrollArea>

          <Separator />
          <Link
            to="/settings/notifications"
            search={{} as any}
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            <Button variant='ghost' className='w-full rounded-none h-12 text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary transition-all gap-2'>
              {t('dashboard.viewAll')}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PopoverNotifications
