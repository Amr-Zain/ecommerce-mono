import { useMemo, useState } from 'react'
import { Check, Dice5, ExternalLink, Import, Layout, Palette, RefreshCcw, Save, Settings, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@ecommerce/ui/components/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@ecommerce/ui/components/dialog'
import { Label } from '@ecommerce/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ecommerce/ui/components/select'
import { Separator } from '@ecommerce/ui/components/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@ecommerce/ui/components/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { useThemeTransition } from '@ecommerce/ui/components/theme-toggle-button'
import { parseThemeCss } from './parse-theme-css'
import { arabicFontOptions, brandColors, latinFontOptions, radiusOptions, themePresets } from './theme-config'
import type { DashboardPreferences, SidebarCollapsible, SidebarSide, SidebarVariant, ThemeMode } from '@/types/dashboard-preferences'
import { useTheme } from '@/components/providers/themeProvider'
import { cn } from '@/lib/utils'

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const { t } = useTranslation()
  const {
    preferences, updatePreferences, resetPreferences, saveStatus, retrySave, isDarkMode,
  } = useTheme()
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const { startTransition } = useThemeTransition()
  const mode = isDarkMode ? 'dark' : 'light'

  const update = (updater: (current: DashboardPreferences) => DashboardPreferences) => updatePreferences(updater)
  const selectPreset = (id: string) => {
    const preset = themePresets.find((item) => item.id === id)
    if (!preset) return
    update((current) => ({
      ...current,
      radius: isRadiusValue(preset.styles.light.radius) ? preset.styles.light.radius : current.radius,
      theme: {
        source: preset.family,
        presetId: preset.id,
        customVariables: { light: {}, dark: {} },
        overrides: { light: {}, dark: {} },
      },
    }))
  }
  const randomPreset = (family: 'shadcn' | 'tweakcn') => {
    const choices = themePresets.filter((preset) => preset.family === family)
    selectPreset(choices[Math.floor(Math.random() * choices.length)].id)
  }
  const applyImport = () => {
    try {
      const parsed = parseThemeCss(importText)
      update((current) => ({
        ...current,
        radius: isRadiusValue(parsed.radius) ? parsed.radius : current.radius,
        theme: {
          source: 'imported',
          presetId: null,
          customVariables: { light: parsed.light, dark: parsed.dark },
          overrides: { light: {}, dark: {} },
        },
      }))
      setImportError('')
      setImportText('')
      setImportOpen(false)
    } catch (error) {
      const key = error instanceof Error ? error.message : 'invalidCss'
      setImportError(t(`themeCustomizer.errors.${key}`, { defaultValue: 'The CSS theme is invalid or contains unsupported variables.' }))
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={preferences.sidebar.side === 'left' ? 'right' : 'left'}
          showOverlay={false}
          className="w-full max-w-md gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b pe-14">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary"><Settings className="size-4" /></span>
              <div>
                <SheetTitle>{t('themeCustomizer.title', { defaultValue: 'Customizer' })}</SheetTitle>
                <SheetDescription>{t('themeCustomizer.description', { defaultValue: 'Customize dashboard theme and layout.' })}</SheetDescription>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <SaveStatus status={saveStatus} onRetry={retrySave} />
              <Button variant="outline" size="sm" onClick={resetPreferences}>
                <RefreshCcw className="size-4" />
                {t('themeCustomizer.reset', { defaultValue: 'Reset' })}
              </Button>
            </div>
          </SheetHeader>

          <Tabs defaultValue="theme" className="min-h-0 flex-1">
            <TabsList className="m-4 grid w-[calc(100%-2rem)] grid-cols-2">
              <TabsTrigger value="theme"><Palette className="size-4" />{t('themeCustomizer.theme', { defaultValue: 'Theme' })}</TabsTrigger>
              <TabsTrigger value="layout"><Layout className="size-4" />{t('themeCustomizer.layout', { defaultValue: 'Layout' })}</TabsTrigger>
            </TabsList>
            <div className="h-[calc(100vh-12.5rem)] overflow-y-auto px-4 pb-6">
              <TabsContent value="theme" className="space-y-6">
                <PresetSelect family="shadcn" selected={preferences.theme.presetId} onSelect={selectPreset} onRandom={randomPreset} />
                <PresetSelect family="tweakcn" selected={preferences.theme.presetId} onSelect={selectPreset} onRandom={randomPreset} />
                <Separator />
                <ControlSection label={t('themeCustomizer.radius', { defaultValue: 'Radius' })}>
                  <div className="grid grid-cols-3 gap-2">
                    {radiusOptions.map((radius) => (
                      <ChoiceButton key={radius} active={preferences.radius === radius} onClick={() => update((current) => ({ ...current, radius }))}>
                        {radius.replace('rem', '')}
                      </ChoiceButton>
                    ))}
                  </div>
                </ControlSection>
                <ControlSection label={t('themeCustomizer.mode', { defaultValue: 'Mode' })}>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as Array<ThemeMode>).map((themeMode) => (
                      <ChoiceButton
                        key={themeMode}
                        active={preferences.mode === themeMode}
                        onClick={() => startTransition(() => update((current) => ({ ...current, mode: themeMode })))}
                      >
                        {t(`themeCustomizer.modes.${themeMode}`, { defaultValue: themeMode })}
                      </ChoiceButton>
                    ))}
                  </div>
                </ControlSection>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FontSelect
                    label={t('themeCustomizer.latinFont', { defaultValue: 'English font' })}
                    value={preferences.fonts.latin}
                    options={latinFontOptions}
                    onChange={(latin) => update((current) => ({ ...current, fonts: { ...current.fonts, latin: latin as DashboardPreferences['fonts']['latin'] } }))}
                  />
                  <FontSelect
                    label={t('themeCustomizer.arabicFont', { defaultValue: 'Arabic font' })}
                    value={preferences.fonts.arabic}
                    options={arabicFontOptions}
                    onChange={(arabic) => update((current) => ({ ...current, fonts: { ...current.fonts, arabic: arabic as DashboardPreferences['fonts']['arabic'] } }))}
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={() => setImportOpen(true)}>
                  <Import className="size-4" />{t('themeCustomizer.import', { defaultValue: 'Import theme CSS' })}
                </Button>
                <Separator />
                <ControlSection label={t('themeCustomizer.brandColors', { defaultValue: 'Brand colors' })}>
                  <div className="space-y-2">
                    {brandColors.map(([variable, fallback]) => {
                      const value = preferences.theme.overrides[mode][variable]
                      return (
                        <label key={variable} className="flex items-center gap-3 rounded-lg border p-2.5">
                          <span className="size-7 rounded-md border" style={{ background: `var(--${variable})` }} />
                          <span className="min-w-0 flex-1 text-sm">{t(`themeCustomizer.colors.${variable}`, { defaultValue: fallback })}</span>
                          <input
                            type="color"
                            aria-label={fallback}
                            className="h-8 w-10 cursor-pointer rounded border bg-transparent"
                            value={isHex(value) ? value : '#64748b'}
                            onChange={(event) => update((current) => ({
                              ...current,
                              theme: {
                                ...current.theme,
                                overrides: {
                                  ...current.theme.overrides,
                                  [mode]: { ...current.theme.overrides[mode], [variable]: event.target.value },
                                },
                              },
                            }))}
                          />
                          {value && (
                            <Button
                              variant="ghost" size="icon-sm" aria-label={t('themeCustomizer.clearColor', { defaultValue: 'Clear color' })}
                              onClick={() => update((current) => {
                                const nextMode = { ...current.theme.overrides[mode] }
                                delete nextMode[variable]
                                return { ...current, theme: { ...current.theme, overrides: { ...current.theme.overrides, [mode]: nextMode } } }
                              })}
                            >×</Button>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </ControlSection>
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Palette className="size-4 text-primary" />
                    {t('themeCustomizer.advanced', { defaultValue: 'Advanced customization' })}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('themeCustomizer.advancedDescription', { defaultValue: 'Create more themes in the TweakCN editor, then import their CSS here.' })}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => window.open('https://tweakcn.com/editor/theme', '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="size-4" />
                    {t('themeCustomizer.openTweakcn', { defaultValue: 'Open TweakCN' })}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <LayoutChoices
                  label={t('themeCustomizer.sidebarVariant', { defaultValue: 'Sidebar variant' })}
                  value={preferences.sidebar.variant}
                  options={['sidebar', 'floating', 'inset'] as Array<SidebarVariant>}
                  onChange={(variant) => update((current) => ({ ...current, sidebar: { ...current.sidebar, variant } }))}
                />
                <Separator />
                <LayoutChoices
                  label={t('themeCustomizer.sidebarCollapse', { defaultValue: 'Sidebar collapse' })}
                  value={preferences.sidebar.collapsible}
                  options={['offcanvas', 'icon', 'none'] as Array<SidebarCollapsible>}
                  onChange={(collapsible) => update((current) => ({ ...current, sidebar: { ...current.sidebar, collapsible } }))}
                />
                <Separator />
                <LayoutChoices
                  label={t('themeCustomizer.sidebarSide', { defaultValue: 'Sidebar position' })}
                  value={preferences.sidebar.side}
                  options={['left', 'right'] as Array<SidebarSide>}
                  onChange={(side) => update((current) => ({ ...current, sidebar: { ...current.sidebar, side } }))}
                />
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('themeCustomizer.importTitle', { defaultValue: 'Import custom theme' })}</DialogTitle>
            <DialogDescription>{t('themeCustomizer.importDescription', { defaultValue: 'Paste CSS variables from :root and .dark blocks. Only supported theme variables are accepted.' })}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="min-h-72 font-mono text-xs"
            placeholder={':root {\n  --primary: #2563eb;\n}\n.dark {\n  --primary: #60a5fa;\n}'}
          />
          {importError && <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><TriangleAlert className="size-4" />{importError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>{t('buttons.cancel', { defaultValue: 'Cancel' })}</Button>
            <Button onClick={applyImport} disabled={!importText.trim()}>{t('themeCustomizer.import', { defaultValue: 'Import theme CSS' })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SaveStatus({ status, onRetry }: { status: string; onRetry: () => void }) {
  const { t } = useTranslation()
  if (status === 'error') return <button className="flex items-center gap-1.5 text-xs text-destructive" onClick={onRetry}><TriangleAlert className="size-3.5" />{t('themeCustomizer.saveError', { defaultValue: 'Save failed — retry' })}</button>
  if (status === 'saving') return <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Save className="size-3.5 animate-pulse" />{t('themeCustomizer.saving', { defaultValue: 'Saving…' })}</span>
  if (status === 'saved') return <span className="flex items-center gap-1.5 text-xs text-emerald-600"><Check className="size-3.5" />{t('themeCustomizer.saved', { defaultValue: 'Saved' })}</span>
  return <span className="text-xs text-muted-foreground">{t('themeCustomizer.accountSynced', { defaultValue: 'Synced to your account' })}</span>
}

function PresetSelect({ family, selected, onSelect, onRandom }: { family: 'shadcn' | 'tweakcn'; selected: string | null; onSelect: (id: string) => void; onRandom: (family: 'shadcn' | 'tweakcn') => void }) {
  const { t } = useTranslation()
  const presets = useMemo(() => themePresets.filter((preset) => preset.family === family), [family])
  return (
    <ControlSection label={family === 'shadcn' ? 'Shadcn UI presets' : 'TweakCN presets'}>
      <div className="flex gap-2">
        <Select value={presets.some((preset) => preset.id === selected) ? selected : null} onValueChange={(value) => value && onSelect(value)}>
          <SelectTrigger className="h-9 min-w-0 flex-1">
            <SelectValue placeholder={t('themeCustomizer.choosePreset', { defaultValue: 'Choose a preset' })} />
          </SelectTrigger>
          <SelectContent align="start" className="max-h-72">
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate">{preset.name}</span>
                  <span className="ms-auto flex shrink-0 gap-0.5">
                    {preset.preview.slice(0, 4).map((color, index) => (
                      <span key={`${preset.id}-${index}`} className="size-3 rounded-full border" style={{ background: color }} />
                    ))}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => onRandom(family)} aria-label={t('themeCustomizer.random', { defaultValue: 'Random preset' })}><Dice5 className="size-4" /></Button>
      </div>
      <div className="mt-2 flex gap-1">
        {presets.find((preset) => preset.id === selected)?.preview.map((color) => <span key={color} className="h-2 flex-1 rounded-full" style={{ background: color }} />)}
      </div>
    </ControlSection>
  )
}

function FontSelect({ label, value, options, onChange }: { label: string; value: string; options: ReadonlyArray<{ value: string; label: string; family: string }>; onChange: (value: string) => void }) {
  return (
    <ControlSection label={label}>
      <Select value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span style={{ fontFamily: option.family }}>{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ControlSection>
  )
}

function LayoutChoices<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<T>; onChange: (value: T) => void }) {
  const { t } = useTranslation()
  return (
    <ControlSection label={label}>
      <div className={cn('grid gap-2', options.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {options.map((option) => (
          <button key={option} className={cn('rounded-lg border p-3 text-start transition-colors hover:bg-muted', value === option && 'border-primary bg-primary/10 text-primary')} onClick={() => onChange(option)}>
            <LayoutPreview option={option} />
            <span className="mt-2 block text-center text-xs font-medium">{t(`themeCustomizer.options.${option}`, { defaultValue: option })}</span>
          </button>
        ))}
      </div>
    </ControlSection>
  )
}

function LayoutPreview({ option }: { option: string }) {
  const right = option === 'right'
  const hidden = option === 'offcanvas'
  const narrow = option === 'icon'
  return (
    <div className={cn('flex h-12 overflow-hidden rounded border bg-background p-1', right && 'flex-row-reverse', option === 'floating' && 'gap-1 bg-muted', option === 'inset' && 'gap-1 bg-muted')}>
      {!hidden && <div className={cn('rounded-sm bg-primary/25', narrow ? 'w-3' : 'w-5', option === 'floating' && 'my-0.5 shadow-sm')} />}
      <div className="flex-1 rounded-sm border border-dashed bg-card" />
    </div>
  )
}

function ControlSection({ label, children }: { label: string; children: React.ReactNode }) {
  return <section><Label className="mb-2 block text-sm font-medium">{label}</Label>{children}</section>
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button type="button" variant={active ? 'default' : 'outline'} size="sm" onClick={onClick}>{children}</Button>
}

function isHex(value: string | undefined): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value))
}

function isRadiusValue(value: string | undefined): value is string {
  return Boolean(value && /^\d+(?:\.\d+)?rem$/.test(value) && Number.parseFloat(value) <= 2)
}
