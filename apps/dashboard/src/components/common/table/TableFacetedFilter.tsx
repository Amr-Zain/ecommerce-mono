import React, { useMemo } from 'react'
import { Check, Loader2, PlusCircle } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@ecommerce/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ecommerce/ui/components/popover'
import useFetch from '@/hooks/UseFetch'
import { ApiResponse } from '@/types/api/http'
import { FieldOption } from '@/types/components/form'
import { Filter, SelectFilter } from '@/types/components/table'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/useDebounce'


export function DataTableFacetedFilter<TData>({
  paramKey,
  title,
  options,
  multiple = true,
  setParam,
  currentValue,
  endpoint,
  queryKey,
  select,
  general,
  closeOnSelect, // optional: force-close after any selection
  hasSearch,
}: {
  paramKey: string
  setParam: (key: string, value: string | string[] | undefined) => void
  currentValue?: any
  closeOnSelect?: boolean
} & SelectFilter) {
  const [searchValue, setSearchValue] = React.useState('')
  const debouncedSearch = useDebounce(searchValue, 600)

  const { data, isPending } = useFetch<ApiResponse<TData[]>, FieldOption[]>({
    endpoint,
    queryKey: queryKey ? [...queryKey, debouncedSearch] : [endpoint, debouncedSearch],
    staleTime: 120_000,
    select,
    general,
    params: hasSearch ? { search: debouncedSearch } : undefined,
    enabled: !!endpoint,
  })

  const [open, setOpen] = React.useState(false)
  const shouldClose = closeOnSelect ?? !multiple
  const { t } = useTranslation()
  const dataOptions = React.useMemo<FieldOption[]>(() => {
    if (endpoint) return data ?? []
    return options ?? []
  }, [endpoint, data, options])

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      if (Array.isArray(currentValue)) return new Set(currentValue as string[])
      if (typeof currentValue === 'string' && currentValue.length > 0) {
        return new Set(
          currentValue
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
      return new Set<string>()
    } else {
      if (typeof currentValue === 'string' && currentValue.length > 0) {
        return new Set([currentValue])
      }
      return new Set<string>()
    }
  }, [currentValue, multiple])

  const handleSelectionChange = (optionValue: string) => {
    if (multiple) {
      const next = new Set(selectedValues)
      if (next.has(optionValue)) next.delete(optionValue)
      else next.add(optionValue)
      const arr = Array.from(next)
      setParam(paramKey, arr.length ? arr : undefined)
    } else {
      const isSelected = selectedValues.has(optionValue)
      setParam(paramKey, isSelected ? undefined : optionValue)
    }

    if (shouldClose) setOpen(false)
  }

  const clearFilter = () => {
    setParam(paramKey, undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex h-8 items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
          disabled={isPending && !!endpoint}
        >
          {isPending && endpoint ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="me-2 h-4 w-4" />
          )}
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {multiple ? (
                <>
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedValues.size}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size} {t('Text.selected')}
                      </Badge>
                    ) : (
                      dataOptions
                        .filter((opt) =>
                          selectedValues.has(opt.value.toString()),
                        )
                        .map((opt) => (
                          <Badge
                            variant="secondary"
                            key={opt.value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {opt.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal line-clamp-1"
                >
                  {
                    dataOptions.find((opt) =>
                      selectedValues.has(opt.value.toString()),
                    )?.label
                  }
                </Badge>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0 overflow-hidden" align="start">
        <Command shouldFilter={!hasSearch}>
          <CommandInput
            placeholder={title}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isPending && endpoint ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{t('Text.noResults')}</CommandEmpty>
                <CommandGroup className="p-0">
                  {dataOptions.map((option) => {
                    const isSelected = selectedValues.has(
                      option.value.toString(),
                    )
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value.toString()}
                        className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=false]:bg-transparent hover:bg-accent hover:text-accent-foreground"
                        onSelect={() =>
                          handleSelectionChange(option.value.toString())
                        }
                      >
                        {multiple ? (
                          <div
                            className={`me-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible'
                              }`}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="me-2 flex h-4 w-4 items-center justify-center">
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        )}
                        {/* {option?.icon && (
                      <option.icon className="me-2 h-4 w-4 text-muted-foreground" />
                    )} */}
                        <span className='line-clamp-2'>{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>

                {selectedValues.size > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup className="p-0">
                      <CommandItem
                        onSelect={clearFilter}
                        className="justify-center text-center data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=false]:bg-transparent hover:bg-accent hover:text-accent-foreground"
                      >
                        {t('Text.clearFilter')}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
