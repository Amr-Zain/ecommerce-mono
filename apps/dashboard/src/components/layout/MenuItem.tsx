import { isPathActive } from '@/util/helpers'
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Link, useLocation } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { useMemo } from 'react'

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@ecommerce/ui/components/sidebar'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ecommerce/ui/components/collapsible'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ecommerce/ui/components/dropdown-menu'

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { MenuItem as IMenuItem } from '@/types/components/sidebar'

export const MenuItem = ({ item }: { item: IMenuItem }) => {
  const pathname = useLocation().pathname
  const hasSubItems = item.subItems && item.subItems.length > 0
  const isActive = useMemo(
    () => isPathActive(item.url, pathname),
    [item.url, pathname],
  )
  const { i18n, t } = useTranslation()
  const { state } = useSidebar()

  const isRTL = useMemo(() => i18n.dir() === 'rtl', [i18n])
  const isCollapsed = state === 'collapsed'

  const translatedTitle = useMemo(() => t(item.title), [item.title, t])

  const Icon = item.icon


  if (hasSubItems) {
    // Collapsed: show a dropdown popover for sub-items
    if (isCollapsed) {
      return (
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton isActive={isActive} tooltip={translatedTitle} className="cursor-pointer" />}>
              {Icon && <Icon />}
              <span className="truncate">{translatedTitle}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isRTL ? 'left' : 'right'}
              align="start"
              dir={isRTL ? 'rtl' : 'ltr'}
              className="text-start"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-start">{translatedTitle}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {item?.subItems?.map((subItem: IMenuItem) => {
                const subIsActive = isPathActive(subItem.url, pathname)
                const translatedSubTitle = t(subItem.title)
                return (
                  <DropdownMenuItem key={subItem.title} render={<Link to={subItem.url} preload="intent" className="w-full" />} className={cn("justify-start text-start", subIsActive && 'bg-accent font-medium')}>
                    {translatedSubTitle}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }

    // Expanded: use collapsible sub-items
    return (
      <Collapsible
        key={item.title}
        defaultOpen={isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem data-expanded={state === 'expanded'}>
          <CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} tooltip={translatedTitle} className="cursor-pointer justify-between" />}>
            <span className="flex items-center gap-2 min-w-0">
              {Icon && <Icon />}
              <span className="truncate">{translatedTitle}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {item.badge && (
                <Badge
                  variant="outline"
                  className="h-5 w-fit px-1 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
              <HugeiconsIcon icon={ArrowRight01Icon} className="rtl:rotate-180 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item?.subItems?.map((subItem) => {
                const subIsActive = isPathActive(subItem.url, pathname)
                const translatedSubTitle = t(subItem.title)
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild isActive={subIsActive}>
                      <Link to={subItem.url} preload="intent">
                        <span>{translatedSubTitle}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive} tooltip={translatedTitle}>
        <Link to={item.url} preload="intent" className="cursor-pointer">
          {Icon && <Icon />}
          <span className="truncate">{translatedTitle}</span>
          {item.badge && (
            <Badge variant="outline" className="ms-auto h-5 w-fit px-1 text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
