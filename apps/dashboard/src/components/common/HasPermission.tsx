import { PermissionAction, useAuthStore } from "@/stores/authStore";

export const HasPermission = ({ entity, action, children }: { entity: string; action: PermissionAction; children: React.ReactNode }) => {
    const { user } = useAuthStore()
    if (user?.permissions && user.permissions[entity] && user.permissions[entity].includes(action)) {
        return children
    }
    return null
}