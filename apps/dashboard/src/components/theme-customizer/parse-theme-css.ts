import { allowedThemeVariables } from './theme-config'
import type { ThemeVariables } from '@/types/dashboard-preferences'

const allowed = new Set<string>([...allowedThemeVariables, 'radius'])
const unsafeValue = /[;{}]|url\s*\(|@import|expression\s*\(/i

export interface ParsedThemeCss {
  light: ThemeVariables
  dark: ThemeVariables
  radius?: string
}

export function parseThemeCss(css: string): ParsedThemeCss {
  if (!css.trim() || css.length > 50_000) throw new Error('invalidCss')

  const light = parseBlock(css, /:root\s*\{([^}]*)\}/i)
  const dark = parseBlock(css, /(?:\.dark|\[data-theme=["']dark["']\])\s*\{([^}]*)\}/i)
  if (!Object.keys(light).length && !Object.keys(dark).length) throw new Error('missingThemeBlocks')
  const radius = Object.entries({ ...dark, ...light }).find(([key]) => key === 'radius')?.[1]
  delete light.radius
  delete dark.radius
  return { light, dark, ...(radius ? { radius } : {}) }
}

function parseBlock(css: string, pattern: RegExp): ThemeVariables {
  const match = css.match(pattern)
  if (!match) return {}
  const result: ThemeVariables = {}
  const declaration = /--([a-z0-9-]+)\s*:\s*([^;]+);?/gi
  let item: RegExpExecArray | null
  while ((item = declaration.exec(match[1])) !== null) {
    const key = item[1].trim()
    const value = item[2].trim()
    if (!allowed.has(key)) throw new Error('unsupportedVariable')
    if (!value || value.length > 256 || unsafeValue.test(value)) throw new Error('invalidVariableValue')
    result[key] = value
  }
  return result
}
