import { describe, expect, it } from 'vitest'
import { parseThemeCss } from './parse-theme-css'
import { themePresets } from './theme-config'

describe('parseThemeCss', () => {
  it('extracts allowlisted light and dark variables', () => {
    expect(parseThemeCss(`
      :root { --primary: #2563eb; --radius: 1rem; }
      .dark { --primary: #60a5fa; --background: oklch(0.15 0 0); }
    `)).toEqual({
      light: { primary: '#2563eb' },
      dark: { primary: '#60a5fa', background: 'oklch(0.15 0 0)' },
      radius: '1rem',
    })
  })

  it('rejects unsupported variables and unsafe values', () => {
    expect(() => parseThemeCss(':root { --unknown: red; }')).toThrow('unsupportedVariable')
    expect(() => parseThemeCss(':root { --primary: url(https://example.com); }')).toThrow('invalidVariableValue')
  })

  it('requires a root or dark theme block', () => {
    expect(() => parseThemeCss('body { color: red; }')).toThrow('missingThemeBlocks')
  })
})

describe('reference theme catalogs', () => {
  it('includes every Shadcn and TweakCN preset from the source dashboard', () => {
    expect(themePresets.filter((preset) => preset.family === 'shadcn')).toHaveLength(11)
    expect(themePresets.filter((preset) => preset.family === 'tweakcn')).toHaveLength(40)
  })
})
