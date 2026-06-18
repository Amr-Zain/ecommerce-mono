import { DashboardHeader } from '@/components/layout/Header'
import { AppSidebar } from '@/components/layout/Sidebar'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '@ecommerce/ui/components/sidebar'
import { TooltipProvider } from '@ecommerce/ui/components/tooltip'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import ConfirmModal from '@/components/common/uiComponents/ConfirmModal'
import { useAlertModal } from '@/stores/useAlertModal'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setupZodI18n } from '@/errorMap'

export const Route = createFileRoute('/_main')({
  beforeLoad: ({ location }) => {
    const { user, token, isAuthenticated, isAuthReady, clearUser } = useAuthStore.getState();

    if (!isAuthReady || !isAuthenticated || !token || !user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (user.user_type !== 'admin' && user.user_type !== 'super_admin') {
      toast('Admin access only')
      clearUser()
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (user?.is_banned) {
      toast('your account had bannded')
      clearUser()
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
    if (!user?.is_active) {
      toast('your account not activated')
      clearUser()
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
  //const { state } = useSidebar()
  const {
    isOpen,
    title,
    desc,
    variant,
    pending,
    setIsOpen,
    handleConfirm,
  } = useAlertModal();
  const { i18n } = useTranslation()


  setupZodI18n(i18n.t.bind(i18n))
  i18n.on('languageChanged', () => setupZodI18n(i18n.t.bind(i18n)))
  const userLanguage = useAuthStore((state) => state.user?.settings?.language)

  useEffect(() => {
    if (userLanguage && i18n.language !== userLanguage) {
      i18n.changeLanguage(userLanguage)
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
      className={cn(
        'flex-1 min-w-0 transition-all duration-300 ease-in-out')}
    >
      <DashboardHeader />

      <main className="flex-1 overflow-auto">
        <div className="w-full p-6">
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
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <LayoutContent />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
