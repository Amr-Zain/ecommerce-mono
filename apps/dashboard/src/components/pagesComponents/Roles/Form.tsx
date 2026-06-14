import { useMemo, useEffect, useCallback } from 'react'
import { z } from 'zod/v4'
import { useTranslation } from 'react-i18next'
import { useMutate } from '@/hooks/UseMutate'
import { queryKeys } from '@/util/queryKeysFactory'
import useFetch from '@/hooks/UseFetch'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import { useForm } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { useNavigate } from '@tanstack/react-router'
import { type ApiResponse } from '@/types/api/http'
import { type RolePermission, type PermissionGroup } from '@/types/api/role'
import { Checkbox } from '@ecommerce/ui/components/checkbox'
import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ecommerce/ui/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Role } from './Config'

interface RoleFormProps {
  role?: Role
  onSuccess?: () => void
}

export default function RoleForm({ role: initialValues, onSuccess: onSuccessCallback }: RoleFormProps) {
  const { t } = useTranslation()
  const isEdit = !!initialValues?.id

  // Fetch all permissions for the form
  const { data: permissionsRes, isLoading: isLoadingPermissions } = useFetch<any>({
    endpoint: 'permissions',
    queryKey: ['permissions-list'],
  })

  const rawData = permissionsRes?.data
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

  const roleSchema = useMemo(() => z.object({
    name_en: z.string().trim().min(2, t('Validation.minChars', { min: 2, field: t('Form.labels.name_en') })),
    name_ar: z.string().trim().min(2, t('Validation.minChars', { min: 2, field: t('Form.labels.name_ar') })),
    permissions: z.array(z.number()).min(1, t('Validation.required', { field: t('titles.permissions') })),
  }), [t])

  const form = useForm<any>({
    resolver: zodFormResolver(roleSchema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      permissions: [],
    },
    mode: 'onChange',
  })

  const { mutate, isPending } = useMutate({
    endpoint: isEdit ? `roles/${initialValues.id}` : 'roles',
    method: isEdit ? 'patch' : 'post',
    mutationKey: queryKeys.roles.get(initialValues?.id?.toString() || 'new'),
    invalidates: [queryKeys.roles.all()],
    redirectTo: onSuccessCallback ? undefined : '/roles',
    onSuccess: onSuccessCallback ? () => onSuccessCallback() : undefined,
  })

  const selectedIds: number[] = form.watch('permissions') || []

  const togglePermission = useCallback((permId: number) => {
    const current: number[] = form.getValues('permissions') || []
    if (current.includes(permId)) {
      form.setValue('permissions', current.filter((id: number) => id !== permId), { shouldValidate: true })
    } else {
      form.setValue('permissions', [...current, permId], { shouldValidate: true })
    }
  }, [form])

  const toggleGroup = useCallback((groupPermissions: any[]) => {
    const current: number[] = form.getValues('permissions') || []
    const groupIds = groupPermissions.map(p => Number(p.id))
    const allSelected = groupIds.every(id => current.includes(id))

    if (allSelected) {
      form.setValue('permissions', current.filter(id => !groupIds.includes(id)), { shouldValidate: true })
    } else {
      const newIds = [...new Set([...current, ...groupIds])]
      form.setValue('permissions', newIds, { shouldValidate: true })
    }
  }, [form])

  const toggleAll = useCallback(() => {
    if (!permissionGroups) return
    const allIds = Object.values(permissionGroups as any).flat().map((p: any) => Number(p.id))
    const current: number[] = form.getValues('permissions') || []
    const allSelected = allIds.every(id => current.includes(id))

    form.setValue('permissions', allSelected ? [] : allIds, { shouldValidate: true })
  }, [form, permissionGroups])

  const isAllSelected = useMemo(() => {
    if (!permissionGroups) return false
    const groups = { ...permissionGroups } as any
    delete groups.cities
    delete groups.carts

    const allIds = Object.values(groups).flat().map((p: any) => Number(p.id))
    return allIds.length > 0 && allIds.every(id => selectedIds.includes(id))
  }, [permissionGroups, selectedIds])

  const onSubmit = (values: any) => {
    const payload = {
      en: { name: values.name_en },
      ar: { name: values.name_ar },
      is_active: true,
      permissions: values.permissions,
    } as any

    mutate(payload)
  }

  useEffect(() => {
    if (initialValues) {
      const defaults: any = {
        name_en: (initialValues as any).en?.name || (initialValues as any).name || '',
        name_ar: (initialValues as any).ar?.name || (initialValues as any).name || '',
        permissions: (initialValues as any).permissions
          ? Object.values((initialValues as any).permissions).flat().map((p: any) => Number(p.id))
          : [],
      }
      form.reset(defaults)
    }
  }, [initialValues, form])

  if (isLoadingPermissions) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Form.labels.name_en')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('Form.labels.name_en')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Form.labels.name_ar')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('Form.labels.name_ar')} dir="rtl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Permissions section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('titles.permissions')}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="rounded-xl"
            >
              {isAllSelected ? t('buttons.deselect_all') : t('buttons.select_all')}
            </Button>
          </div>

          {form.formState.errors.permissions && (
            <p className="text-sm text-destructive">
              {form.formState.errors.permissions.message as string}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionGroups && Object.entries(permissionGroups as unknown as PermissionGroup).map(([groupKey, permissions]) => {
              const groupIds = permissions.map((p: any) => Number(p.id))
              const allGroupSelected = groupIds.every((id: number) => selectedIds.includes(id))
              const someGroupSelected = groupIds.some((id: number) => selectedIds.includes(id))

              return (
                <Card key={groupKey} className="rounded-xl border border-border overflow-hidden">
                  <CardHeader className="pb-2 pt-2 px-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold capitalize">
                      {t(`permissions_categories.${groupKey}`) || groupKey.replace(/-/g, ' ')}
                    </CardTitle>
                    <Checkbox
                      checked={allGroupSelected}
                      data-indeterminate={someGroupSelected && !allGroupSelected ? "true" : undefined}
                      onCheckedChange={() => toggleGroup(permissions)}
                    />
                  </CardHeader>
                  <CardContent className="px-4 pb-2 pt-0 space-y-2">
                    {permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center justify-between gap-2 cursor-pointer text-sm py-0.5 hover:text-foreground/80 transition-colors"
                      >
                        <span className="text-muted-foreground text-xs">
                          {perm.title}
                        </span>
                        <Checkbox
                          checked={selectedIds.includes(Number(perm.id))}
                          onCheckedChange={() => togglePermission(Number(perm.id))}
                        />
                      </label>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl min-w-32"
          >
            {isPending ? t('buttons.loading') : (isEdit ? t('actions.update', { entity: t('common.role') }) : t('actions.create', { entity: t('common.role') }))}
          </Button>
        </div>
      </form>
    </Form>
  )
}
