import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDown01Icon,
  Logout01Icon,
  UserCircleIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { useMemo, useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@ecommerce/ui/components/sidebar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ecommerce/ui/components/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@ecommerce/ui/components/tooltip'

import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Logo } from '../common/Icons'
import ConfirmModal from '../common/uiComponents/ConfirmModal'
import { MenuItem as MenuItemComponent } from './MenuItem'
import type {
  SidebarCollapsible,
  SidebarSide,
  SidebarVariant,
} from '@/types/dashboard-preferences'
import { cn } from '@/lib/utils'
import { getNavigationGroups } from '@/util/navigation'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { useDashboardLogout } from '@/hooks/useDashboardLogout'
import { queryKeys } from '@/util/queryKeysFactory'
import { NotificationsResponse } from '@/routes/_main/settings/notifications'
import useFetch from '@/hooks/UseFetch'

export function AppSidebar({
  side,
  variant,
  collapsible,
}: {
  side: SidebarSide
  variant: SidebarVariant
  collapsible: SidebarCollapsible
}) {
  const { t, i18n } = useTranslation()
  const { state } = useSidebar()
  const { data: user } = useDashboardProfile()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isRTL = useMemo(
    () => i18n.dir(i18n.language) === 'rtl',
    [i18n.language],
  )
  const { mutateAsync: logoutAsync, isPending: isLoggingOut } =
    useDashboardLogout()

  const handleConfirmLogout = async () => {
    await logoutAsync({})
  }

  const { data: unreadCount, isLoading } = useFetch<number>({
    endpoint: 'notifications',
    queryKey: queryKeys.notifications.list(),
    params: { per_page: 5 },
    //  const unreadCount = data?.data?.unread_notifications_count || 0
    select: (res: any) => res?.data?.unread_notifications_count || (0 as any),
    enabled: false,
  })
  const groups = getNavigationGroups(unreadCount || 0)

  return (
    <Sidebar
      side={side}
      variant={variant}
      collapsible={collapsible}
      className="h-screen"
    >
      <SidebarHeader className="group">
        <SidebarMenu>
          <SidebarMenuItem className="group/header relative flex min-h-12 items-center justify-between">
            <Link
              to="/"
              className={cn(
                'flex min-w-0 grow !cursor-pointer transition-opacity',
                state === 'collapsed' &&
                  'md:group-hover/header:pointer-events-none md:group-hover/header:opacity-0',
              )}
            >
              <SidebarMenuButton
                size="lg"
                className={cn(
                  'justify-between !cursor-pointer',
                  state === 'collapsed' && 'hover:bg-transparent',
                )}
              >
                <div
                  className={cn(
                    'relative flex items-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                    state === 'collapsed' ? '' : 'gap-2',
                  )}
                >
                  <div
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm',
                      state !== 'expanded' ? 'size-8' : 'size-9',
                    )}
                  >
                    <Logo className="size-5 text-current" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <h2 className="font-semibold truncate">
                      {t('menu.dashboard')}
                    </h2>
                    <p className="text-xs truncate">{t('menu.adminPanel')}</p>
                  </div>
                </div>
              </SidebarMenuButton>
            </Link>
            {collapsible !== 'none' && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <SidebarTrigger
                      aria-label={t('themeCustomizer.toggleSidebar', {
                        defaultValue: 'Toggle sidebar',
                      })}
                      className={cn(
                        'size-8 rounded-md transition-all',
                        state === 'expanded'
                          ? 'ms-auto cursor-w-resize'
                          : 'pointer-events-none absolute inset-0 m-auto opacity-0 md:group-hover/header:pointer-events-auto md:group-hover/header:opacity-100',
                      )}
                    />
                  }
                />
                <TooltipContent
                  side={side === 'left' ? 'right' : 'left'}
                  align="center"
                  className="dashboard-tooltip"
                >
                  {t('themeCustomizer.toggleSidebar', {
                    defaultValue: 'Toggle sidebar',
                  })}
                </TooltipContent>
              </Tooltip>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <div key={group.label}>
            <SidebarGroup className="p-0">
              <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
                  {group.items.map((item) => (
                    <MenuItemComponent
                      key={item.title}
                      item={item}
                      tooltipSide={side === 'left' ? 'right' : 'left'}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index < groups.length - 1 && <SidebarSeparator />}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="w-full data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.name || 'Admin User'}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || 'admin@company.com'}
                  </span>
                </div>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="ms-auto transition-transform duration-200 group-data-popup-open/menu-button:rotate-180"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={<Link to={'/profile'} preload="intent" />}
                  >
                    <HugeiconsIcon icon={UserIcon} className="me-2 h-4 w-4" />
                    {t('Text.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmOpen(true)}
                    className="flex gap-2 cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={Logout01Icon}
                      className="me-2 h-4 w-4"
                    />
                    {t('Text.logout')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {collapsible !== 'none' && <SidebarRail />}
      <ConfirmModal
        title={t('modals.logout.title')}
        desc={t('modals.logout.desc')}
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onClick={handleConfirmLogout}
        Pending={isLoggingOut}
        variant="destructive"
      />
    </Sidebar>
  )
}
