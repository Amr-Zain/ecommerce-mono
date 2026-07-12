import { describe, expect, it } from 'vitest'
import { normalizeDashboardPreferences } from './themeProvider'

describe('normalizeDashboardPreferences', () => {
  it('normalizes snake-case API preferences without losing the selected preset', () => {
    const preferences = normalizeDashboardPreferences({
      version: 1,
      mode: 'light',
      theme: {
        source: 'tweakcn',
        preset_id: 'modern-minimal',
        custom_variables: { light: {}, dark: {} },
        overrides: {
          light: { primary: 'oklch(0.6 0.2 200)' },
          dark: {},
        },
      },
      radius: '0.75rem',
      fonts: { latin: 'manrope', arabic: 'cairo' },
      sidebar: { variant: 'floating', collapsible: 'icon', side: 'right' },
    }, 'en')

    expect(preferences.theme.presetId).toBe('modern-minimal')
    expect(preferences.theme.customVariables).toEqual({ light: {}, dark: {} })
    expect(preferences.theme.overrides.light.primary).toBe('oklch(0.6 0.2 200)')
    expect(preferences.mode).toBe('light')
    expect(preferences.sidebar).toEqual({ variant: 'floating', collapsible: 'icon', side: 'right' })
  })

  it('rejects unsupported cached CSS variables', () => {
    const preferences = normalizeDashboardPreferences({
      version: 1,
      theme: {
        source: 'imported',
        presetId: null,
        customVariables: {
          light: { primary: '#123456', unsafe: 'url(example)' },
          dark: {},
        },
        overrides: { light: {}, dark: {} },
      },
    }, 'ar')

    expect(preferences.theme.customVariables.light).toEqual({ primary: '#123456' })
    expect(preferences.sidebar.side).toBe('right')
  })
})
