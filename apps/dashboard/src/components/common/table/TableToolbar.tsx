import React, { useCallback, useEffect, useState } from 'react'
import { Table as TanStackTable } from '@tanstack/react-table'
import { Button } from '@ecommerce/ui/components/button'
import { X } from 'lucide-react'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { DataTableFacetedFilter } from './TableFacetedFilter'
import { ExtractFile } from './Export'
import { Input } from '@ecommerce/ui/components/input'
import { Filter } from '@/types/components/table'
import { useDebounce } from '@/hooks/useDebounce'
import { useTranslation } from 'react-i18next'

export function DataTableToolbar<TData>({
  table,
  searchKey,
  filters,
  toolbar,
  enableUrlState,
  exports,
}: {
  table: TanStackTable<TData>
  searchKey?: keyof TData | string
  filters?: Filter[]
  toolbar?: React.ReactNode
  enableUrlState?: boolean
  exports?: {
    name: string
    endpoint?: string
  }
  exportName?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const router = useRouter()
  const search = (enableUrlState ? useSearch({} as any) : {}) as Record<string, any>

  const searchKeyId = searchKey ? String(searchKey) : undefined
  const initialSearchValue =
    enableUrlState && searchKeyId
      ? ((Array.isArray(search[searchKeyId])
        ? (search[searchKeyId]?.[0] ?? '')
        : (search[searchKeyId] ?? '')) ?? '')
      : searchKeyId
        ? ((table.getColumn(searchKeyId)?.getFilterValue() as string) ?? '')
        : ''

  const [inputValue, setInputValue] = useState(initialSearchValue)
  const debouncedSearchValue = useDebounce(inputValue, 500)

  const setParam = useCallback(
    (key: string, value: string | string[] | undefined) => {
      if (!enableUrlState) return
      const current = router.state.location.search as Record<string, any>
      const next = { ...current }

      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete next[key]
      } else {
        next[key] = value
      }

      const same = JSON.stringify(current) === JSON.stringify(next)
      if (same) return

      if ('page' in next) next.page = 1
      navigate({ search: next as any, replace: true })
    },
    [enableUrlState, navigate, router.state.location.search],
  )

  useEffect(() => {
    if (enableUrlState && searchKeyId) {
      setParam(searchKeyId, debouncedSearchValue || undefined)
    } else if (searchKeyId) {
      table.getColumn(searchKeyId)?.setFilterValue(debouncedSearchValue)
    }
  }, [debouncedSearchValue, enableUrlState, searchKeyId, setParam, table])

  useEffect(() => {
    setInputValue(initialSearchValue)
  }, [initialSearchValue])

  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    (enableUrlState && filters?.some((c) => search[c.id] !== undefined)) ||
    (enableUrlState && searchKey && search[String(searchKey)] !== undefined)

  const resetAllFilters = () => {
    if (enableUrlState) {
      const current = router.state.location.search as Record<string, any>
      const next = { ...current }
      if (searchKeyId) delete next[searchKeyId]
      filters?.forEach((c) => delete next[c.id])
      if ('page' in next) next.page = 1
      const same = JSON.stringify(current) === JSON.stringify(next)
      if (!same) navigate({ search: next as any, replace: true })
    } else {
      table.resetColumnFilters()
    }
    setInputValue('')
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center flex-wrap gap-2">
        {searchKeyId && (
          <Input
            type="search"
            placeholder={t('Text.search')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8 w-[180px] lg:w-[250px]"
          />
        )}

        {filters?.map((filterColumn) => {
          return (
            filterColumn.type === 'custom' ?
              filterColumn.jsx :
              <DataTableFacetedFilter
                key={filterColumn.id}
                paramKey={filterColumn.id}
                id={filterColumn.id}
                title={filterColumn.title}
                options={filterColumn.options}
                endpoint={filterColumn.endpoint}
                queryKey={filterColumn.queryKey}
                general={filterColumn.general}
                select={filterColumn.select}
                multiple={filterColumn.multiple}
                setParam={setParam}
                currentValue={search[filterColumn.id]}
                hasSearch={filterColumn.hasSearch}
              />
          )
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            className="h-8 px-2 lg:px-3"
          >
            {t('Text.reset')}
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2">
        {toolbar}
        {exports && (
          <ExtractFile
            table={table}
            filename={exports.name || 'data.xlsx'}
            endpoint={exports.endpoint}
          />
        )}
      </div>
    </div>
  )
}
