import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SidebarInset, SidebarProvider } from '@ecommerce/ui/components/sidebar'
import { TooltipProvider } from '@ecommerce/ui/components/tooltip'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

import ConfirmModal from '@/components/common/uiComponents/ConfirmModal'
import { DashboardHeader } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import { useTheme } from '@/components/providers/themeProvider'
import { setupZodI18n } from '@/errorMap'
import { shouldReverseSidebarLayout } from '@/lib/sidebar-layout'
import { cn } from '@/lib/utils'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { clearDashboardSession } from '@/lib/dashboard-session'
import type { DashboardUser } from '@/types/auth'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'

export const Route = createFileRoute('/_main')({
  beforeLoad: ({ context, location }) => {
    const user = context.queryClient.getQueryData<DashboardUser>(
      queryKeys.auth.profile(),
    )
    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (user.user_type !== 'admin' && user.user_type !== 'super_admin') {
      toast('Admin access only')
      clearDashboardSession({ redirect: false })
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (user.is_banned) {
      toast('your account had bannded')
      clearDashboardSession({ redirect: false })
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (!user.is_active) {
      toast('your account not activated')
      clearDashboardSession({ redirect: false })
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: Layout,
})

function LayoutContent() {
  const { isOpen, title, desc, variant, pending, setIsOpen, handleConfirm } =
    useAlertModal()
  const { i18n } = useTranslation()

  const { data: user } = useDashboardProfile()
  const userLanguage = user?.settings.language ?? i18n.language

  useEffect(() => {
    const handleLanguageChanged = () => setupZodI18n(i18n.t.bind(i18n))
    handleLanguageChanged()
    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [i18n])

  useEffect(() => {
    if (i18n.language !== userLanguage) {
      void i18n.changeLanguage(userLanguage)
      const dir = i18n.dir(userLanguage)
      document.documentElement.setAttribute('dir', dir)
      document.documentElement.lang = userLanguage
    }
  }, [userLanguage, i18n])

  useEffect(() => {
    const dir = i18n.dir(i18n.language)
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.lang = i18n.language
  }, [i18n.language])
  return (
    <div
      className={cn('flex-1 min-w-0 transition-all duration-300 ease-in-out')}
    >
      <DashboardHeader />

      <main className="flex-1 overflow-auto">
        <div className="w-full px-4 py-5 lg:px-6 lg:py-6">
          <Outlet />
        </div>
      </main>

      <ConfirmModal
        title={title!}
        desc={desc!}
        open={isOpen}
        setOpen={setIsOpen}
        onClick={handleConfirm!}
        Pending={!!pending}
        variant={variant}
      />
    </div>
  )
}

export function Layout() {
  const { preferences } = useTheme()
  const { i18n } = useTranslation()
  const direction = i18n.dir(i18n.language)
  const reverseLayout = shouldReverseSidebarLayout(
    preferences.sidebar.side,
    direction,
  )
  const sidebar = (
    <AppSidebar
      side={preferences.sidebar.side}
      variant={preferences.sidebar.variant}
      collapsible={preferences.sidebar.collapsible}
    />
  )
  const content = (
    <SidebarInset className="min-w-0 overflow-hidden">
      <LayoutContent />
    </SidebarInset>
  )
  return (
    <TooltipProvider>
      <SidebarProvider
        className={cn(
          preferences.sidebar.collapsible === 'none' && 'sidebar-none-mode',
          reverseLayout ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        {sidebar}
        {content}
      </SidebarProvider>
    </TooltipProvider>
  )
}
