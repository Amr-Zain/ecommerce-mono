
import { useState, useRef } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@ecommerce/ui/components/command'
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
} from '@ecommerce/ui/components/popover'
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import {
    getDashboardMenuItems,
    getProductsAndShowRoomsMenuItems,
    getEarningMenuItems,
    getSettingsMenuItems,
    usersMenuItems,
} from '@/util/data'
import { cn, hasPermission } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useMemo } from 'react'

export function HeaderSearch() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const user = useAuthStore((state) => state.user)

    const flatMenuItems = useMemo(() => {
        const filterMenuItems = (items: any[]): any[] => {
            return items
                .map((item) => {
                    if (item.subItems && item.subItems.length > 0) {
                        const filteredSubItems = filterMenuItems(item.subItems)
                        if (filteredSubItems.length > 0) {
                            return { ...item, subItems: filteredSubItems }
                        }
                        return null
                    }

                    if (item.checkPermission) {
                        const entity = item.permissionEntity ?? item.title.slice(5).replace(/_/g, '-')
                        return hasPermission(entity, 'index') ? item : null
                    }

                    return item
                })
                .filter((item): item is any => item !== null)
        }

        const allMenus = [
            ...getDashboardMenuItems,
            ...getProductsAndShowRoomsMenuItems,
            ...getEarningMenuItems,
            ...getSettingsMenuItems(),
            ...usersMenuItems,
        ]

        const filteredMenus = filterMenuItems(allMenus)

        return filteredMenus.reduce((acc: any[], item: any) => {
            const addUnique = (newItem: any) => {
                if (!newItem.url) return
                if (!acc.some((i: any) => i.url === newItem.url)) {
                    acc.push(newItem)
                }
            }

            if (item.url) {
                addUnique({ title: item.title, url: item.url, icon: item.icon })
            }

            if (item.subItems) {
                item.subItems.forEach((subItem: any) => {
                    addUnique({
                        title: subItem.title,
                        url: subItem.url,
                        icon: item.icon,
                        category: item.title
                    })
                })
            }
            return acc
        }, [])
    }, [user])

    return (
        <Command className="relative hidden sm:block w-64 overflow-visible bg-transparent p-0 rounded-none border-none">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor >
                    <div className="relative" ref={containerRef}>
                        <HugeiconsIcon icon={Search01Icon} className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <CommandPrimitive.Input
                            placeholder={t('Text.search')}
                            className={cn(
                                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                "ps-10 w-64 bg-background/50 h-10"
                            )}
                            onFocus={() => setOpen(true)}
                            onClick={() => setOpen(true)}
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="p-0 w-64"
                    align="start"
                >
                    <CommandList>
                        <CommandEmpty>{t('Text.noResults')}</CommandEmpty>
                        <CommandGroup heading={t('Text.navigation')}>
                            {flatMenuItems.map((item, index) => (
                                <CommandItem
                                    key={index}
                                    value={`${t(item.title)} ${item.url}`}
                                    onSelect={() => {
                                        setOpen(false)
                                        navigate({ to: item.url })
                                    }}
                                >
                                    {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : <HugeiconsIcon icon={Search01Icon} className="mr-2 h-4 w-4" />}
                                    <span>{t(item.title)}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </PopoverContent>
            </Popover>
        </Command>
    )
}
