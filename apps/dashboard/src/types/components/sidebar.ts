
export interface MenuItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  isActive?: boolean
  subItems?: MenuItem[]
  checkPermission?: boolean
  /** Override the entity name used for permission checks (defaults to title derived from menu key). */
  permissionEntity?: string
}
