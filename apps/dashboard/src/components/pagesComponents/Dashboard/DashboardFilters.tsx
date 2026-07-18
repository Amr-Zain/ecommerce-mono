import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import { useTranslation } from 'react-i18next'
import { GitCompareArrows } from 'lucide-react'
import { DashboardExportButton } from './DashboardExportButton'
import type {
  DashboardExportDataset,
  DashboardGranularity,
  DashboardPreset,
  DashboardQueryParams,
} from '@/types/api/dashboard'
import { cn } from '@/lib/utils'

interface DashboardFiltersProps {
  value: DashboardQueryParams
  onChange: (next: DashboardQueryParams) => void
  showGranularity?: boolean
  exportDataset?: DashboardExportDataset
}

const presets: Array<DashboardPreset> = [
  'today',
  '7d',
  '30d',
  '90d',
  'year',
  'custom',
]
const granularities: Array<DashboardGranularity> = [
  'auto',
  'day',
  'week',
  'month',
]

const isoDate = (date: Date) => date.toISOString().slice(0, 10)

export function DashboardFilters({
  value,
  onChange,
  showGranularity = true,
  exportDataset,
}: DashboardFiltersProps) {
  const { t } = useTranslation()
  const preset = value.preset ?? '30d'

  const update = (patch: DashboardQueryParams) => {
    onChange({ ...value, ...patch })
  }

  const selectPreset = (next: DashboardPreset) => {
    if (next === 'custom' && (!value.from || !value.to)) {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - 29)
      update({ preset: 'custom', from: isoDate(from), to: isoDate(to) })
      return
    }
    update({
      preset: next,
      from: next === 'custom' ? value.from : undefined,
      to: next === 'custom' ? value.to : undefined,
    })
  }

  const reset = () =>
    onChange({
      preset: '30d',
      from: undefined,
      to: undefined,
      granularity: 'auto',
      compare: true,
      sections: value.sections,
    })

  return (
    <div className="rounded-lg border border-muted/70 bg-background/80 p-2 shadow-sm">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('dashboard.period')}
          </span>
          {presets.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={preset === item ? 'default' : 'ghost'}
              className={cn(
                'h-8 rounded-md px-3 text-xs',
                preset !== item && 'text-muted-foreground',
              )}
              onClick={() => selectPreset(item)}
            >
              {t(`dashboard.presets.${item}`)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {preset === 'custom' && (
            <>
              <Input
                aria-label={t('dashboard.from')}
                type="date"
                value={value.from ?? ''}
                onChange={(event) => {
                  const from = event.target.value
                  update({
                    from,
                    to: value.to && from > value.to ? from : value.to,
                  })
                }}
                className="h-8 w-36"
              />
              <Input
                aria-label={t('dashboard.to')}
                type="date"
                value={value.to ?? ''}
                onChange={(event) => {
                  const to = event.target.value
                  update({
                    to,
                    from: value.from && to < value.from ? to : value.from,
                  })
                }}
                className="h-8 w-36"
              />
            </>
          )}
          {showGranularity && (
            <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/30 p-1">
              <span className="px-2 text-xs font-semibold text-muted-foreground">
                {t('dashboard.granularity')}
              </span>
              {granularities.map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={
                    (value.granularity ?? 'auto') === item
                      ? 'secondary'
                      : 'ghost'
                  }
                  className="h-7 rounded px-2 text-xs"
                  onClick={() => update({ granularity: item })}
                >
                  {t(`dashboard.granularities.${item}`)}
                </Button>
              ))}
            </div>
          )}
          <Button
            type="button"
            size="sm"
            variant={value.compare ?? true ? 'secondary' : 'ghost'}
            className="h-8 gap-1.5"
            aria-pressed={value.compare ?? true}
            onClick={() => update({ compare: !(value.compare ?? true) })}
          >
            <GitCompareArrows className="size-3.5" />
            {t('dashboard.comparePrevious')}
          </Button>
          {exportDataset && (
            <DashboardExportButton dataset={exportDataset} filters={value} />
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={reset}
          >
            {t('common.reset')}
          </Button>
        </div>
      </div>
    </div>
  )
}
