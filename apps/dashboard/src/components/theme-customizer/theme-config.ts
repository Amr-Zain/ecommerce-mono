import { shadcnThemePresets } from './shadcn-ui-theme-presets'
import { tweakcnPresets } from './tweakcn-theme-presets'
import type { ThemeVariables } from '@/types/dashboard-preferences'

export const allowedThemeVariables = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
  'font-sans', 'font-serif', 'font-mono', 'shadow-2xs', 'shadow-xs', 'shadow-sm', 'shadow',
  'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-color', 'shadow-opacity',
  'shadow-blur', 'shadow-spread', 'shadow-offset-x', 'shadow-offset-y',
  'spacing', 'tracking-normal', 'letter-spacing',
] as const

export const brandColors = [
  ['primary', 'Primary'], ['primary-foreground', 'Primary foreground'],
  ['secondary', 'Secondary'], ['secondary-foreground', 'Secondary foreground'],
  ['accent', 'Accent'], ['accent-foreground', 'Accent foreground'],
  ['muted', 'Muted'], ['muted-foreground', 'Muted foreground'],
] as const

export interface ThemePreset {
  source?: 'SAVED' | 'BUILT_IN'
  createdAt?: string
  label?: string
  styles: { light: ThemeVariables; dark: ThemeVariables }
}

export interface ColorTheme extends ThemePreset {
  id: string
  name: string
  family: 'shadcn' | 'tweakcn'
  preview: Array<string>
}

function toColorThemes(catalog: Record<string, ThemePreset>, family: ColorTheme['family']): Array<ColorTheme> {
  return Object.entries(catalog).map(([id, preset]) => ({
    ...preset,
    id,
    name: preset.label ?? id,
    family,
    preview: [
      preset.styles.light.primary,
      preset.styles.light.secondary,
      preset.styles.light.accent,
      preset.styles.light.muted,
    ].filter((value): value is string => Boolean(value)),
  }))
}

export const themePresets: Array<ColorTheme> = [
  ...toColorThemes(shadcnThemePresets, 'shadcn'),
  ...toColorThemes(tweakcnPresets, 'tweakcn'),
]

export const radiusOptions = ['0rem', '0.3rem', '0.45rem', '0.5rem', '0.75rem', '1rem']

export const latinFontOptions = [
  { value: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif" },
  { value: 'manrope', label: 'Manrope', family: "'Manrope', system-ui, sans-serif" },
  { value: 'poppins', label: 'Poppins', family: "'Poppins', system-ui, sans-serif" },
] as const

export const arabicFontOptions = [
  { value: 'noto-sans-arabic', label: 'Noto Sans Arabic', family: "'Noto Sans Arabic', sans-serif" },
  { value: 'cairo', label: 'Cairo', family: "'Cairo', sans-serif" },
  { value: 'tajawal', label: 'Tajawal', family: "'Tajawal', sans-serif" },
] as const

export function getDashboardFontFamily(language: string | undefined, fonts: { latin: string; arabic: string }) {
  const options = language === 'ar' ? arabicFontOptions : latinFontOptions
  const selected = options.find((option) => option.value === (language === 'ar' ? fonts.arabic : fonts.latin))
  return selected?.family ?? options[0].family
}

export function getThemePreset(id: string | null) {
  return themePresets.find((preset) => preset.id === id)
}
