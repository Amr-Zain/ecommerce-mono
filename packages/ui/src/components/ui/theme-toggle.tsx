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
import gif from "@/assets/logo-animation.gif"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { startTransition } = useThemeTransition()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const handleThemeToggle = useCallback(() => {
    const newMode = theme === 'dark' ? 'light' : 'dark'
    startTransition(() => {
      setTheme(newMode)
    })
  }, [setTheme, startTransition, theme])
  const { t } = useTranslation()
  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger >
          <ThemeToggleButton
            theme={theme as any}
            onClick={handleThemeToggle}
            variant="gif"
            url={gif}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('toggleTheme')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
