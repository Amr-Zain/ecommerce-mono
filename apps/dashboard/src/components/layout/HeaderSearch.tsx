import { useEffect, useMemo, useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ecommerce/ui/components/command'
import { Button } from '@ecommerce/ui/components/button'
import { Kbd } from '@ecommerce/ui/components/kbd'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'

import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { getNavigationGroups } from '@/util/navigation'

export function HeaderSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: user } = useDashboardProfile()

  const groups = useMemo(() => getNavigationGroups(), [user])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    navigate({ to: url })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="relative h-9 w-9 shrink-0 items-center justify-center gap-2 px-0 text-muted-foreground shadow-sm sm:w-40 sm:justify-start sm:px-3 lg:w-56"
        aria-label={t('commandSearch.open', { defaultValue: 'Search navigation' })}
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Search01Icon} className="size-4 shrink-0 sm:me-1" />
        <span className="hidden truncate sm:inline">{t('Text.search')}</span>
        <Kbd className="absolute end-1.5 hidden sm:inline-flex">
          <span className="hidden font-sans text-xs md:inline">Ctrl+</span>K
        </Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('commandSearch.title', { defaultValue: 'Navigation search' })}
        description={t('commandSearch.description', {
          defaultValue: 'Search the dashboard navigation',
        })}
        className="top-1/2! max-w-[calc(100%-2rem)] -translate-y-1/2! sm:max-w-xl"
      >
        <Command className="rounded-xl p-1">
          <CommandInput
            autoFocus
            placeholder={t('commandSearch.placeholder', { defaultValue: 'What do you need?' })}
          />
          <CommandList className="max-h-[min(420px,60vh)]">
            <CommandEmpty>{t('Text.noResults')}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup
                key={group.label}
                heading={t(group.label)}
                className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:gap-0.5"
              >
                {group.items.flatMap((item) => {
                  const searchableItems = item.subItems?.length ? item.subItems : [item]
                  return searchableItems.map((searchItem) => {
                    const Icon = searchItem.icon ?? item.icon
                    return (
                      <CommandItem
                        key={searchItem.url}
                        value={`${t(searchItem.title)} ${t(group.label)} ${searchItem.url}`}
                        onSelect={() => handleSelect(searchItem.url)}
                        className="min-h-10 items-center py-2"
                      >
                        {Icon ? <Icon className="size-4" /> : <HugeiconsIcon icon={Search01Icon} className="size-4" />}
                        <span className="truncate">{t(searchItem.title)}</span>
                        <span className="ms-auto hidden truncate text-xs text-muted-foreground sm:block">
                          {searchItem.url}
                        </span>
                      </CommandItem>
                    )
                  })
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
