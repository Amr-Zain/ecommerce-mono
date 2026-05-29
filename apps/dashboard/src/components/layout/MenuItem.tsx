import { isPathActive } from '@/util/helpers'
import { ChevronRight } from 'lucide-react'
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ecommerce/ui/components/dropdown-menu'

import { useTranslation } from 'react-i18next'
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
            <DropdownMenuTrigger >
              <SidebarMenuButton isActive={isActive} tooltip={translatedTitle}>
                {Icon && <Icon />}
                <span>{translatedTitle}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isRTL ? 'left' : 'right'}
              align="start"
              dir={isRTL ? 'rtl' : 'ltr'}
              className="text-start"
            >
              <DropdownMenuLabel className="text-start">{translatedTitle}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item?.subItems?.map((subItem: IMenuItem) => {
                const subIsActive = isPathActive(subItem.url, pathname)
                const translatedSubTitle = t(subItem.title)
                return (
                  <DropdownMenuItem key={subItem.title} className="justify-start text-start">
                    <Link
                      to={subItem.url}
                      preload="intent"
                      className={subIsActive ? 'bg-accent font-medium' : ''}
                    >
                      {translatedSubTitle}
                    </Link>
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
          <CollapsibleTrigger >
            <SidebarMenuButton isActive={isActive} tooltip={translatedTitle}>
              {Icon && <Icon />}
              <span>{translatedTitle}</span>
              {item.badge && (
                <Badge
                  variant="outline"
                  className="ms-auto h-5 w-fit px-1 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className="rtl:rotate-180 ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item?.subItems?.map((subItem) => {
                const subIsActive = isPathActive(subItem.url, pathname)
                const translatedSubTitle = t(subItem.title)
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton

                      isActive={subIsActive}
                    >
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
      <SidebarMenuButton isActive={isActive} tooltip={translatedTitle}>
        <Link to={item.url} preload="intent">
          {Icon && <Icon />}
          <span>{translatedTitle}</span>
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
