import type { MenuItem } from '@/types/components/sidebar'
import { hasPermission } from '@/lib/utils'
import {
  getDashboardMenuItems,
  getEarningMenuItems,
  getProductsAndShowRoomsMenuItems,
  getSettingsMenuItems,
  usersMenuItems,
} from '@/util/data'

export interface NavigationGroup {
  label: string
  items: Array<MenuItem>
}
export function filterPermittedMenuItems(items: Array<MenuItem>): Array<MenuItem> {
  return items
    .map((item) => {
      if (item.subItems?.length) {
        const subItems = filterPermittedMenuItems(item.subItems)
        return subItems.length ? { ...item, subItems } : null
      }

      if (item.checkPermission) {
        const entity = item.permissionEntity ?? item.title.slice(5).replace(/_/g, '-')
        return hasPermission(entity, 'index') ? item : null
      }

      return item
    })
    .filter((item): item is MenuItem => item !== null)
}

export function getNavigationGroups(notificationCount = 0): Array<NavigationGroup> {
  return [
    { label: 'menu.dashboard', items: filterPermittedMenuItems(getDashboardMenuItems) },
    { label: 'menu.earning', items: filterPermittedMenuItems(getEarningMenuItems) },
    {
      label: 'menu.productsAndShowRooms',
      items: filterPermittedMenuItems(getProductsAndShowRoomsMenuItems),
    },
    { label: 'menu.users', items: filterPermittedMenuItems(usersMenuItems) },
    {
      label: 'menu.settings',
      items: filterPermittedMenuItems(getSettingsMenuItems(notificationCount)),
    },
  ].filter((group) => group.items.length > 0)
}
