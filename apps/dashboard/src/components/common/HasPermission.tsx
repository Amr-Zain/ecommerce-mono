import type { PermissionAction } from '@/types/auth'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { userHasPermission } from '@/lib/utils'

export const HasPermission = ({ entity, action, children }: { entity: string; action: PermissionAction; children: React.ReactNode }) => {
    const { data: user } = useDashboardProfile()
    if (userHasPermission(user, entity, action)) {
        return children
    }
    return null
}
