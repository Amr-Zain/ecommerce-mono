export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeSource = 'default' | 'shadcn' | 'tweakcn' | 'imported'
export type ThemeVariables = Record<string, string>
export type SidebarVariant = 'sidebar' | 'floating' | 'inset'
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'
export type SidebarSide = 'left' | 'right'

export interface DashboardPreferences {
  version: 1
  mode: ThemeMode
  theme: {
    source: ThemeSource
    presetId: string | null
    customVariables: { light: ThemeVariables; dark: ThemeVariables }
    overrides: { light: ThemeVariables; dark: ThemeVariables }
  }
  radius: string
  fonts: {
    latin: 'inter' | 'manrope' | 'poppins'
    arabic: 'noto-sans-arabic' | 'cairo' | 'tajawal'
  }
  sidebar: {
    variant: SidebarVariant
    collapsible: SidebarCollapsible
    side: SidebarSide
  }
}

export type AppearanceSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function createDefaultDashboardPreferences(language?: string): DashboardPreferences {
  return {
    version: 1,
    mode: 'dark',
    theme: {
      source: 'default',
      presetId: null,
      customVariables: { light: {}, dark: {} },
      overrides: { light: {}, dark: {} },
    },
    radius: '0.45rem',
    fonts: { latin: 'inter', arabic: 'noto-sans-arabic' },
    sidebar: {
      variant: 'inset',
      collapsible: 'offcanvas',
      side: language === 'ar' ? 'right' : 'left',
    },
  }
}
