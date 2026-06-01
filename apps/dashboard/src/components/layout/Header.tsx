import { SidebarTrigger } from '@ecommerce/ui/components/sidebar'
import { HeaderSearch } from './HeaderSearch'
import { Button } from '@ecommerce/ui/components/button'

import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Logout01Icon } from "@hugeicons/core-free-icons"
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
  TooltipProvider,
  TooltipTrigger,
} from '@ecommerce/ui/components/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { ThemeToggle } from '@ecommerce/ui/components/theme-toggle'
import { LanguageToggle } from '@ecommerce/ui/components/language-toggle'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect, useCallback } from 'react'
import { useMutate } from '@/hooks/UseMutate'
import ConfirmModal from '../common/uiComponents/ConfirmModal'
import { Link, useNavigate } from '@tanstack/react-router'
import { ApiResponse } from '@/types/api/http'
import { toast } from 'sonner'
import PopoverNotifications from './Notifications'

export function DashboardHeader() {
  const { t, i18n } = useTranslation()
  const isRTL = useMemo(() => i18n.dir() === 'rtl', [i18n])
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)

  const [confirmOpen, setConfirmOpen] = useState(false)

  const navigate = useNavigate()
  const initials = useMemo(() => {
    const name = user?.name?.trim()
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
    onSuccess: (data) => {
      clearUser()
      toast.success(data.message)
      navigate({ to: '/auth/login' })
    },
    onError: (_err, error) => {
      toast.success(error.message)
    }
  })

  const handleConfirmLogout = async () => {
    await logoutAsync({})
  }



  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 relative">
          <SidebarTrigger className="p-2 hover:bg-accent rounded-md transition-colors flex md:hidden cursor-pointer" />

          <HeaderSearch />
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger >
                <PopoverNotifications />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('notifications')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                  <AvatarFallback className="bg-gradient-primary text-white">
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
        </div>
      </div>
    </header>
  )
}
// export default ThemeToggleVariantsDemo
