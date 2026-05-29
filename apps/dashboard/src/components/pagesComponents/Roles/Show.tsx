import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import useFetch from '@/hooks/UseFetch'
import { rolesQueryKeys } from '@/util/queryKeysFactory'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { ShieldCheck, Edit, Calendar } from 'lucide-react'
import { type RolePermission } from '@/types/api/role'
import { formatDate } from '@/util/helpers'
import { Button } from '@ecommerce/ui/components/button'
import { HasPermission } from '@/components/common/HasPermission'

export const RoleShow = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams({ from: '/_main/roles/show/$id' })

    const { data: res } = useFetch<any>({
        endpoint: `roles/${id}`,
        queryKey: rolesQueryKeys.get(id),
        suspense: true,
    })

    const role = res?.data

    // Fetch all permissions for grouping
    const { data: allPermissionsRes } = useFetch<any>({
        endpoint: 'permissions',
        queryKey: ['permissions-list'],
    })

    const rawData = allPermissionsRes?.data
    let permissionGroups = rawData?.data || rawData

    if (permissionGroups && typeof permissionGroups === 'object') {
        const cleanedGroups: any = {}
        Object.keys(permissionGroups).forEach(key => {
            if (Array.isArray(permissionGroups[key])) {
                cleanedGroups[key] = permissionGroups[key]
            }
        })
        permissionGroups = cleanedGroups
    }

    const rolePermissionIds = new Set(
        role?.permissions
            ? Object.values(role.permissions).flat().map((p: any) => String(p.id))
            : []
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('titles.role_details')}</h1>
                <div className="flex items-center gap-3">
                    <HasPermission entity="roles" action="update">
                        <Link to="/roles/edit/$id" params={{ id }}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                {t('actions.edit')}
                            </Button>
                        </Link>
                    </HasPermission>
                </div>
            </div>

            <Card className="rounded-xl border border-border pt-0!">
                <CardHeader className="bg-muted/30 border-b border-border p-4!">
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        {role?.name || role?.en?.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground mb-1 block">{t('Form.labels.name_en')}</span>
                            <p className="font-semibold text-lg">{role?.en?.name || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground mb-1 block">{t('Form.labels.name_ar')}</span>
                            <p className="font-semibold text-lg">{role?.ar?.name || '—'}</p>
                        </div>
                        {/* <div>
                            <span className="text-sm font-medium text-muted-foreground mb-1 block">{t('Form.labels.prefix')}</span>
                            <Badge variant="outline" className="text-sm">{role?.prefix || '—'}</Badge>
                        </div> */}
                        <div>
                            <span className="text-sm font-medium text-muted-foreground mb-1 block">{t('table.columns.status')}</span>
                            <Badge variant={role?.is_active ? 'default' : 'secondary'} className="text-sm">
                                {role?.is_active ? t('status.active') : t('status.inactive')}
                            </Badge>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{t('table.createdAt')}: {role?.created_at ? formatDate(role.created_at) : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{t('table.updatedAt')}: {role?.updated_at ? formatDate(role.updated_at) : '—'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-bold px-1">{t('titles.permissions')}</h2>
                {rolePermissionIds.size > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissionGroups && Object.entries(permissionGroups as Record<string, RolePermission[]>).map(([groupKey, permissions]) => {
                            const groupRolePermissions = permissions.filter((p: any) => rolePermissionIds.has(String(p.id)))

                            if (groupRolePermissions.length === 0) return null

                            return (
                                <Card key={groupKey} className="rounded-xl border border-border shadow-sm overflow-hidden pt-0">
                                    <CardHeader className="p-2! bg-muted/20 border-b border-border gap-0">
                                        <CardTitle className="text-sm font-bold capitalize">
                                            {t(`permissions_categories.${groupKey}`) || groupKey.replace(/-/g, ' ')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {groupRolePermissions.map((perm: RolePermission) => (
                                                <Badge key={perm.id} variant="secondary" className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0.5">
                                                    {perm.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="rounded-xl border border-dashed border-border bg-muted/10">
                        <CardContent className="p-8 text-center">
                            <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground font-medium">{t('messages.no_permissions_assigned') || t('messages.no_permissions')}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
