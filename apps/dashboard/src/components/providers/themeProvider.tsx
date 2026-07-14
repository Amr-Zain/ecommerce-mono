import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ApiResponseBase } from '@/types/api/http'
import type { AppearanceSaveStatus, DashboardPreferences, ThemeMode, ThemeVariables } from '@/types/dashboard-preferences'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { createDefaultDashboardPreferences } from '@/types/dashboard-preferences'
import { allowedThemeVariables, getDashboardFontFamily, getThemePreset } from '@/components/theme-customizer/theme-config'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
}

type ThemeProviderState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  preferences: DashboardPreferences
  updatePreferences: (updater: (current: DashboardPreferences) => DashboardPreferences) => void
  resetPreferences: () => void
  saveStatus: AppearanceSaveStatus
  retrySave: () => void
  isDarkMode: boolean
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const { data: user } = useDashboardProfile()
  const userId = user?.id
  const language = user?.settings.language
  const cacheKey = userId ? `${storageKey}:${userId}` : storageKey
  const queryClient = useQueryClient()
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => readCachedPreferences(cacheKey, language, defaultTheme))
  const [saveStatus, setSaveStatus] = useState<AppearanceSaveStatus>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSave = useRef<DashboardPreferences | null>(null)
  const hasLocalChanges = useRef(false)
  const activeUserId = useRef(userId)

  useEffect(() => {
    if (activeUserId.current === userId) return
    activeUserId.current = userId
    hasLocalChanges.current = false
    pendingSave.current = null
    setPreferences(readCachedPreferences(cacheKey, language, defaultTheme))
    setSaveStatus('idle')
  }, [cacheKey, defaultTheme, language, userId])

  const { data } = useFetch<ApiResponseBase<DashboardPreferences>>({
    endpoint: 'profile/dashboard-preferences',
    queryKey: ['dashboard-preferences', userId],
    enabled: Boolean(userId),
    retry: 1,
  })
  const { mutateAsync } = useMutate<ApiResponseBase<DashboardPreferences>, DashboardPreferences>({
    endpoint: 'profile/dashboard-preferences',
    mutationKey: ['dashboard-preferences', userId],
    method: 'put',
    showToast: false,
  })

  useEffect(() => {
    const response = data as ApiResponseBase<DashboardPreferences> | undefined
    if (!response?.data || hasLocalChanges.current) return
    const serverPreferences = normalizeDashboardPreferences(response.data, language, defaultTheme)
    setPreferences(serverPreferences)
    localStorage.setItem(cacheKey, JSON.stringify(serverPreferences))
    localStorage.setItem(storageKey, serverPreferences.mode)
  }, [cacheKey, data, defaultTheme, language, storageKey])

  const persist = useCallback(async (next: DashboardPreferences) => {
    if (!userId) return
    setSaveStatus('saving')
    try {
      const response = await mutateAsync(next)
      const saved = normalizeDashboardPreferences(response.data, language, defaultTheme)
      pendingSave.current = null
      localStorage.setItem(cacheKey, JSON.stringify(saved))
      localStorage.setItem(storageKey, saved.mode)
      queryClient.setQueryData(['dashboard-preferences', userId], response)
      setPreferences(saved)
      setSaveStatus('saved')
    } catch {
      pendingSave.current = next
      setSaveStatus('error')
    }
  }, [cacheKey, defaultTheme, language, mutateAsync, queryClient, storageKey, userId])

  const queueSave = useCallback((next: DashboardPreferences) => {
    pendingSave.current = next
    localStorage.setItem(cacheKey, JSON.stringify(next))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void persist(next), 500)
  }, [cacheKey, persist])

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
  }, [])

  const updatePreferences = useCallback((updater: (current: DashboardPreferences) => DashboardPreferences) => {
    hasLocalChanges.current = true
    setPreferences((current) => {
      const next = updater(current)
      queueSave(next)
      return next
    })
  }, [queueSave])

  const resetPreferences = useCallback(() => {
    hasLocalChanges.current = true
    const next = createDefaultDashboardPreferences(language)
    setPreferences(next)
    queueSave(next)
  }, [language, queueSave])

  const retrySave = useCallback(() => {
    if (pendingSave.current) void persist(pendingSave.current)
  }, [persist])

  const theme = preferences.mode
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemDark)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    root.classList.add(isDarkMode ? 'dark' : 'light')
    allowedThemeVariables.forEach((variable) => root.style.removeProperty(`--${variable}`))
    const mode = isDarkMode ? 'dark' : 'light'
    const preset = preferences.theme.source === 'imported'
      ? preferences.theme.customVariables[mode]
      : getThemePreset(preferences.theme.presetId)?.styles[mode] ?? {}
    Object.entries({ ...preset, ...preferences.theme.overrides[mode] }).forEach(([key, value]) => {
      if (allowedThemeVariables.includes(key as (typeof allowedThemeVariables)[number])) {
        root.style.setProperty(`--${key}`, value)
      }
    })
    root.style.setProperty('--radius', preferences.radius)
    root.style.setProperty('--font-sans', getDashboardFontFamily(language, preferences.fonts))
    localStorage.setItem(storageKey, theme)
  }, [isDarkMode, language, preferences, storageKey, theme])

  const value = useMemo(() => ({
    theme,
    setTheme: (nextTheme: ThemeMode) => {
      updatePreferences((current) => ({ ...current, mode: nextTheme }))
    },
    preferences,
    updatePreferences,
    resetPreferences,
    saveStatus,
    retrySave,
    isDarkMode,
  }), [isDarkMode, preferences, resetPreferences, retrySave, saveStatus, theme, updatePreferences])

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

function readCachedPreferences(key: string, language: string | undefined, fallbackMode: ThemeMode): DashboardPreferences {
  try {
    const cached: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (cached) return normalizeDashboardPreferences(cached, language, fallbackMode)
  } catch {
    // Ignore stale or malformed browser state; the server remains authoritative.
  }
  return { ...createDefaultDashboardPreferences(language), mode: fallbackMode }
}

export function normalizeDashboardPreferences(
  value: unknown,
  language: string | undefined,
  fallbackMode: ThemeMode = 'dark',
): DashboardPreferences {
  const defaults = { ...createDefaultDashboardPreferences(language), mode: fallbackMode }
  const record = asRecord(value)
  if (record.version !== 1) return defaults

  const theme = asRecord(record.theme)
  const customVariables = asRecord(theme.customVariables ?? theme.custom_variables)
  const overrides = asRecord(theme.overrides)
  const fonts = asRecord(record.fonts)
  const sidebar = asRecord(record.sidebar)

  return {
    version: 1,
    mode: oneOf(record.mode, ['light', 'dark', 'system'], defaults.mode),
    theme: {
      source: oneOf(theme.source, ['default', 'shadcn', 'tweakcn', 'imported'], defaults.theme.source),
      presetId: stringOrNull(
        theme.presetId !== undefined ? theme.presetId : theme.preset_id,
        defaults.theme.presetId,
      ),
      customVariables: {
        light: themeVariables(customVariables.light),
        dark: themeVariables(customVariables.dark),
      },
      overrides: {
        light: themeVariables(overrides.light),
        dark: themeVariables(overrides.dark),
      },
    },
    radius: typeof record.radius === 'string' ? record.radius : defaults.radius,
    fonts: {
      latin: oneOf(fonts.latin, ['inter', 'manrope', 'poppins'], defaults.fonts.latin),
      arabic: oneOf(fonts.arabic, ['noto-sans-arabic', 'cairo', 'tajawal'], defaults.fonts.arabic),
    },
    sidebar: {
      variant: oneOf(sidebar.variant, ['sidebar', 'floating', 'inset'], defaults.sidebar.variant),
      collapsible: oneOf(sidebar.collapsible, ['offcanvas', 'icon', 'none'], defaults.sidebar.collapsible),
      side: oneOf(sidebar.side, ['left', 'right'], defaults.sidebar.side),
    },
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function oneOf<T extends string>(value: unknown, options: ReadonlyArray<T>, fallback: T): T {
  return typeof value === 'string' && options.includes(value as T) ? value as T : fallback
}

function stringOrNull(value: unknown, fallback: string | null): string | null {
  return value === null ? null : typeof value === 'string' ? value : fallback
}

function themeVariables(value: unknown): ThemeVariables {
  return Object.fromEntries(
    Object.entries(asRecord(value)).filter(
      ([key, variable]) => allowedThemeVariables.includes(key as (typeof allowedThemeVariables)[number]) && typeof variable === 'string',
    ),
  ) as ThemeVariables
}
