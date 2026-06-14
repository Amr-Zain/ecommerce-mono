import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, UserCircleIcon, Logout01Icon, UserIcon } from "@hugeicons/core-free-icons"
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

import { useTranslation } from 'react-i18next'
import {
  getDashboardMenuItems,
  getSettingsMenuItems,
  usersMenuItems,
  getEarningMenuItems,
  getProductsAndShowRoomsMenuItems,
} from '@/util/data'
import { MenuItem as MenuItemComponent } from './MenuItem'
import { MenuItem } from '@/types/components/sidebar'
import { cn, hasPermission } from '@/lib/utils'
import { Logo } from '../common/Icons'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import ConfirmModal from '../common/uiComponents/ConfirmModal'
import { useMutate } from '@/hooks/UseMutate'
import { ApiResponse } from '@/types/api/http'
import { queryKeys } from '@/util/queryKeysFactory'
import { NotificationsResponse } from '@/routes/_main/settings/notifications'
import useFetch from '@/hooks/UseFetch'

export function AppSidebar() {
  const { t, i18n } = useTranslation()
  const { state } = useSidebar()
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const navigate = useNavigate()
  const isRTL = useMemo(() => i18n.dir(i18n.language) === 'rtl', [i18n.language]);
  const { mutateAsync: logoutAsync, isPending: isLoggingOut } = useMutate<ApiResponse>({
    endpoint: 'auth/logout',
    mutationKey: ['logout'],
    method: 'post',
    onSuccess: () => {
      clearUser()
      navigate({ to: '/auth/login' })
    },
  })

  const handleConfirmLogout = async () => {
    await logoutAsync({})
  }

  const { data: unreadCount, isLoading } = useFetch<number>({
    endpoint: 'notifications',
    queryKey: queryKeys.notifications.list(),
    params: { per_page: 5 },
    customBaseUrl: import.meta.env.VITE_BASE_URL_API,
    //  const unreadCount = data?.data?.unread_notifications_count || 0
    select: (res: any) => res?.data?.unread_notifications_count || 0 as any,
    enabled: false
  })
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .map((item) => {
        // If it has sub-items, we check sub-items instead of the item itself as requested
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = filterMenuItems(item.subItems)
          // Parent is visible only if it has visible sub-items
          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems }
          }
          return null
        }

        // If it's a leaf item, check permission if required
        if (item.checkPermission) {
          const entity = item.permissionEntity ?? item.title.slice(5).replace(/_/g, '-')
          return hasPermission(entity, 'index') ? item : null
        }

        return item
      })
      .filter((item): item is MenuItem => item !== null)
  }

  const groups = [
    {
      label: t('menu.dashboard'),
      items: filterMenuItems(getDashboardMenuItems),
    },
    {
      label: t('menu.earning'),
      items: filterMenuItems(getEarningMenuItems),
    },
    {
      label: t('menu.productsAndShowRooms'),
      items: filterMenuItems(getProductsAndShowRoomsMenuItems),
    },
    {
      label: t('menu.users'),
      items: filterMenuItems(usersMenuItems),
    },
    {
      label: t('menu.settings'),
      items: filterMenuItems(getSettingsMenuItems(unreadCount || 0)),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <Sidebar
      side={isRTL ? 'right' : 'left'}
      collapsible="icon"
      className="fixed h-screen"
    >
      <SidebarHeader className="group">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-between items-center">
            <Link
              to="/"
              className={cn(
                'grow !cursor-pointer',
                state === 'collapsed' ? 'group-hover:hidden flex' : 'flex'
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
                    'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative flex',
                    state === 'collapsed' ? '' : 'gap-2',
                  )}
                >
                  <div
                    className={cn(
                      'rounded-full bg-gradient-primary flex items-center justify-center shrink-0 shadow-glow',
                      state !== 'expanded' ? 'size-8' : 'size-9',
                    )}
                  >
                    <Logo className="w-5 h-5 text-white" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <h2 className="font-semibold truncate">{t('menu.dashboard')}</h2>
                    <p className="text-xs truncate">{t('menu.adminPanel')}</p>
                  </div>
                </div>
              </SidebarMenuButton>
            </Link>
            <SidebarTrigger
              className={cn(
                'p-2 size-8 rounded-md transition-colors cursor-w-resize',
                state === 'expanded' ? 'ms-auto block' : 'hidden group-hover:block mx-auto',
              )}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <div key={group.label}>
            <SidebarGroup>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className='gap-2'>
                  {group.items.map((item) => (
                    <MenuItemComponent key={item.title} item={item} />
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
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="w-full data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground" />}>
                <div className="flex aspect-square bg-gradient-primary size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
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
                <HugeiconsIcon icon={ArrowDown01Icon} className="ms-auto transition-transform duration-200 group-data-popup-open/menu-button:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link to={'/profile'} preload="intent" />}>
                    <HugeiconsIcon icon={UserIcon} className="me-2 h-4 w-4" />
                    {t('Text.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setConfirmOpen(true)
                    }}
                    className='flex gap-2 cursor-pointer'
                  >
                  <HugeiconsIcon icon={Logout01Icon} className="me-2 h-4 w-4" />
                  {t('Text.logout')}
                </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <ConfirmModal
        title={t('modals.logout.title')}
        desc={
          t('modals.logout.desc')}
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onClick={handleConfirmLogout}
        Pending={isLoggingOut}
        variant="destructive"
      />
    </Sidebar>
  )
}
