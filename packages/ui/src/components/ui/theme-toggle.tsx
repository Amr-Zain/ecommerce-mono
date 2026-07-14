import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeToggleButton, useThemeTransition } from './theme-toggle-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { useTheme } from '@/components/providers/themeProvider'

export function ThemeToggle() {
  const { isDarkMode, setTheme } = useTheme()
  const { startTransition } = useThemeTransition()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const handleThemeToggle = useCallback(() => {
    const newMode = isDarkMode ? 'light' : 'dark'
    startTransition(() => {
      setTheme(newMode)
    })
  }, [isDarkMode, setTheme, startTransition])
  const { t } = useTranslation()
  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <ThemeToggleButton
            theme={isDarkMode ? 'dark' : 'light'}
            onClick={handleThemeToggle}
            variant="circle"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('toggleTheme')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
