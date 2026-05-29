export interface RolePermission {
    id: number
    name: string
    title: string
    route_name: string
}

export type PermissionGroup = Record<string, RolePermission[]>
