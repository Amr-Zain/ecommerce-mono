import { Languages, Globe, Check } from "lucide-react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import { useTranslation } from "react-i18next"

// import { useAuthStore } from "@/stores/authStore"
// import { useMutate } from "@/hooks/UseMutate"
// import { ApiResponse } from "@/types/api/http"
import { toast } from "sonner"

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  // const user = useAuthStore((state) => state.user)
  // const updateUser = useAuthStore((state) => state.updateUser)

  // const { mutateAsync } = useMutate<ApiResponse, any>({
  //   mutationKey: ['profile/settings'],
  //   endpoint: 'profile/settings',
  //   method: 'patch',
  // })

  const changeLanguage = async (lng: string) => {
    try {
      // Optimistically or after success - let's do after success for language
      // await mutateAsync({
      //   locale: lng,
      //   allow_notifications: user?.settings?.allow_notifications ? 1 : 0
      // })

      i18n.changeLanguage(lng)
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lng

      // updateUser({
      //   settings: {
      //     ...user?.settings,
      //     language: lng
      //   }
      // })
      toast.success(t('messages.language_updated') || 'Language updated successfully')
    } catch (error) {
      console.error('Failed to update language', error)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger >
            <DropdownMenuTrigger >
              <Button variant="ghost" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">{t('language')}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('en')}>
              <div className="flex items-center w-full">
                <Languages className="me-2 h-4 w-4" />
                {t('english')}
                {i18n.language === 'en' && <Check className="ms-auto h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('ar')}>
              <div className="flex items-center w-full">
                <Languages className="me-2 h-4 w-4" />
                {t('arabic')}
                {i18n.language === 'ar' && <Check className="ms-auto h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>{t('language')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}