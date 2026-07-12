import { SidebarTrigger, useSidebar } from '@ecommerce/ui/components/sidebar'
import { Button } from '@ecommerce/ui/components/button'

import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons"
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
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { ThemeToggle } from '@ecommerce/ui/components/theme-toggle'
import { LanguageToggle } from '@ecommerce/ui/components/language-toggle'
import { useTranslation } from 'react-i18next'
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from '@tanstack/react-router'
import ConfirmModal from '../common/uiComponents/ConfirmModal'
import { HeaderSearch } from './HeaderSearch'
import PopoverNotifications from './Notifications'
import type { ApiResponse } from '@/types/api/http'
import { useAuthStore } from '@/stores/authStore'
import { useMutate } from '@/hooks/UseMutate'
import { useTheme } from '@/components/providers/themeProvider'

const ThemeCustomizer = lazy(() =>
  import('@/components/theme-customizer').then((module) => ({ default: module.ThemeCustomizer })),
)

export function DashboardHeader() {
  const { t, i18n } = useTranslation()
  const isRTL = useMemo(() => i18n.dir() === 'rtl', [i18n])
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const { preferences } = useTheme()
  const { isMobile, state: sidebarState } = useSidebar()
  const showHeaderSidebarTrigger = preferences.sidebar.collapsible !== 'none' && (
    isMobile || (preferences.sidebar.collapsible === 'offcanvas' && sidebarState === 'collapsed')
  )

  const navigate = useNavigate()
  const initials = useMemo(() => {
    const name = user?.name.trim()
    if (!name) return 'A'
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }, [user?.name])

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



  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-6">
        <div className="relative flex min-w-0 items-center gap-2 sm:gap-4">
          {showHeaderSidebarTrigger && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <SidebarTrigger
                    className="shrink-0 rounded-md transition-colors"
                    aria-label={t('themeCustomizer.toggleSidebar', { defaultValue: 'Toggle sidebar' })}
                  />
                }
              />
              <TooltipContent className="dashboard-tooltip">
                {t('themeCustomizer.toggleSidebar', { defaultValue: 'Toggle sidebar' })}
              </TooltipContent>
            </Tooltip>
          )}

          <HeaderSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          <div className="shrink-0"><ThemeToggle /></div>
          <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('themeCustomizer.open', { defaultValue: 'Customize dashboard' })}
                    onClick={() => setCustomizerOpen(true)}
                  />
                }
              >
                <HugeiconsIcon icon={Settings01Icon} className="size-5" />
              </TooltipTrigger>
              <TooltipContent className="dashboard-tooltip"><p>{t('themeCustomizer.open', { defaultValue: 'Customize dashboard' })}</p></TooltipContent>
          </Tooltip>
          <LanguageToggle />

          <Tooltip>
              <TooltipTrigger >
                <PopoverNotifications />
              </TooltipTrigger>
              <TooltipContent className="dashboard-tooltip">
                <p>{t('notifications')}</p>
              </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger >
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
                aria-label={t('profile')}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image?.url ?? ''}
                    alt={user?.name ?? 'Profile'}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" dir={isRTL ? 'rtl' : 'ltr'}>
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
                <DropdownMenuSeparator />
                <Link to={'/profile'}>
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={UserIcon} className="me-2 h-4 w-4" />
                    {t('Text.profile')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setConfirmOpen(true)
                  }}
                >
                  <HugeiconsIcon icon={Logout01Icon} className="me-2 h-4 w-4" />
                  {t('Text.logout')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfirmModal
            title={t('modals.logout.title')}
            desc={
              t('modals.logout.desc')
            }
            open={confirmOpen}
            setOpen={setConfirmOpen}
            onClick={handleConfirmLogout}
            Pending={isLoggingOut}
            variant="destructive"
          />
          <Suspense fallback={null}>
            <ThemeCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
// export default ThemeToggleVariantsDemo
