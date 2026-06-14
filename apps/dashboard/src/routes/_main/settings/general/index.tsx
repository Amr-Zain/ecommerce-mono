import AppForm from '@/components/common/form/AppForm'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { FieldProp } from '@/types/components/form'
import { queryKeys } from '@/util/queryKeysFactory'
import { zodFormResolver } from '@/lib/schema/resolver'
import { createFileRoute } from '@tanstack/react-router'
import { Settings, Trophy, Bell, ClipboardList, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod/v4'
import { TabsList, TabsTrigger, TabsContent } from '@ecommerce/ui/components/tabs'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import { motion, AnimatePresence } from 'motion/react'
import { SettingsGeneralSkeleton } from '@/components/pagesComponents/Settings/General/Skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ecommerce/ui/components/card'

export const Route = createFileRoute('/_main/settings/general/')({
  component: RouteComponent,
  pendingComponent: SettingsGeneralSkeleton,
})

type Setting = {
  id: number
  key: string
  value: string | number | boolean
  group: string
  group_label?: string
  type: string
  key_label: string
  created_at: string
}

// Map API type to form field type
function getFieldType(apiType: string): FieldProp<any>['type'] {
  switch (apiType) {
    case 'boolean':
      return 'switch'
    case 'integer':
      return 'number'
    case 'string':
    default:
      return 'text'
  }
}

// Build zod schema entry based on API type
function buildSchemaForType(apiType: string, t: (key: string) => string) {
  switch (apiType) {
    case 'boolean':
      return z.boolean().optional()
    case 'integer':
      return z.coerce.number().min(0, { message: t('Validation.min_zero') })
    case 'string':
    default:
      return z.string().min(1, { message: t('Validation.requiredSimple') })
  }
}

// Group icon mapping
const groupIcons: Record<string, LucideIcon> = {
  general: Settings,
  loyalty: Trophy,
  notification: Bell,
}
const DefaultGroupIcon = ClipboardList

function RouteComponent() {
  const { t } = useTranslation()

  const { data } = useFetch<ApiResponse<Setting[], 'settings'>>({
    endpoint: 'settings',
    queryKey: queryKeys.settings.list('general'),
    suspense: true,
  })

  const settings = data?.data.settings ?? []

  // Group settings by group
  const groupedSettings = useMemo(() => {
    const groups: Record<string, { label: string; settings: Setting[] }> = {}
    settings.forEach((setting) => {
      if (!groups[setting.group]) {
        groups[setting.group] = {
          label: setting.group_label || setting.group,
          settings: []
        }
      }
      groups[setting.group].settings.push(setting)
    })
    return groups
  }, [settings])

  // Build dynamic schema from all settings
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {}
    settings.forEach((setting) => {
      shape[setting.key] = buildSchemaForType(setting.type, t)
    })
    return z.object(shape)
  }, [settings, t])

  // Build default/current values from settings
  const formValues = useMemo(() => {
    const values: Record<string, any> = {}
    settings.forEach((setting) => {
      values[setting.key] = setting.value
    })
    return values
  }, [settings])

  const form = useForm({
    resolver: zodFormResolver(schema),
    defaultValues: formValues,
    values: formValues,
    mode: 'onChange',
  })

  const { errors, submitCount } = form.formState

  // Build fields per group
  const fieldsByGroup = useMemo(() => {
    const result: Record<string, FieldProp<any>[]> = {}
    Object.entries(groupedSettings).forEach(([group, groupData]) => {
      result[group] = groupData.settings
        .map((setting) => {
          const fieldType = getFieldType(setting.type)
          return {
            name: setting.key,
            label: setting.key_label || t(`settings.${setting.key}`, {
              defaultValue: setting.key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            }),
            type: fieldType,
            span: fieldType === 'switch' ? 1 : 2,
          } as FieldProp<any>
        })
        .sort((a, b) => {
          // Move switches to the end
          if (a.type === 'switch' && b.type !== 'switch') return 1;
          if (a.type !== 'switch' && b.type === 'switch') return -1;
          return 0;
        })
    })
    return result
  }, [groupedSettings, t])

  const groups = Object.keys(fieldsByGroup)
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  // Set initial tab
  useEffect(() => {
    if (groups.length > 0 && !activeTab) {
      setActiveTab(groups[0])
    }
  }, [groups, activeTab])

  // Navigate to first group with errors on submission
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstErrorGroup = groups.find((group) =>
        fieldsByGroup[group]?.some((field) => field.name && errors[field.name as string])
      )
      if (firstErrorGroup && firstErrorGroup !== activeTab) {
        setActiveTab(firstErrorGroup)
      }
    }
  }, [submitCount, errors, groups, fieldsByGroup, activeTab])

  const { mutate, isPending } = useMutate({
    endpoint: 'settings',
    method: 'patch',
    mutationKey: queryKeys.settings.list('general'),
  })

  const onSubmit = (values: any) => {
    const settingsPayload: Record<string, any>[] = []
    Object.entries(values).forEach(([key, value]) => {
      settingsPayload.push({ key, value })
    })
    mutate({ settings: settingsPayload })
  }




  return (
    <div className="flex flex-col gap-6 p-4">
      <SmartBreadcrumbs entityKey="settings.general" />

      {groups.length > 0 ? (
        <AnimatedTabs
          value={activeTab}
          onValueChange={setActiveTab}
          items={groups.map((group) => ({ value: group, label: groupedSettings[group].label }))}
          renderTabsList={(itemsList, activeValue) => (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-58 shrink-0">
                <div className="sticky top-20 w-full">
                  <TabsList className="flex flex-col h-auto w-full items-stretch justify-start p-0 bg-transparent border-none shadow-none">
                    {itemsList.map((item) => {
                      const Icon = groupIcons[item.value] ?? DefaultGroupIcon
                      return (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className="w-full flex items-center justify-start gap-3 px-4 py-3 h-auto data-[state=active]:text-primary transition-all hover:bg-muted/50 text-left border border-transparent whitespace-nowrap"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="font-semibold capitalize">
                            {item.label}
                          </span>
                          {fieldsByGroup[item.value]?.some((field) => field.name && errors[field.name as string]) && (
                            <span className="ms-auto flex h-2 w-2 shrink-0 rounded-full bg-destructive animate-pulse" />
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>
              </aside>

              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {groups.map((group) =>
                    group === activeValue ? (
                      <motion.div
                        key={group}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabsContent key={group} value={group} className="m-0 focus-visible:outline-none">
                          <Card className="shadow-sm border-muted/60 overflow-hidden">
                            <CardHeader className="bg-muted/10 border-b border-muted/40 pb-2!">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  {(() => {
                                    const Icon = groupIcons[group] ?? DefaultGroupIcon
                                    return <Icon className="h-5 w-5" />
                                  })()}
                                </div>
                                <CardTitle className="text-xl capitalize">
                                  {groupedSettings[group].label}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="p-8">
                              <AppForm
                                schema={schema}
                                fields={fieldsByGroup[group]}
                                providedForm={form}
                                onSubmit={onSubmit}
                                isLoading={isPending}
                                gridColumns={2}
                                submitButtonText={t('buttons.save')}
                                showSubmitButton={true}
                                spacing="lg"
                              />
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </motion.div>
                    ) : null
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
          <Settings className="h-10 w-10 mb-4 opacity-20" />
          <p>{t('settings.no_settings_available')}</p>
        </div>
      )}
    </div>
  )
}
