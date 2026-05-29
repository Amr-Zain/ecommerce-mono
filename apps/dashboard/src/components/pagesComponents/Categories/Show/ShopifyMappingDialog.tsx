import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ecommerce/ui/components/dialog'
import { Button } from '@ecommerce/ui/components/button'
import { Input } from '@ecommerce/ui/components/input'
import { Label } from '@ecommerce/ui/components/label'
import { Switch } from '@ecommerce/ui/components/switch'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { z } from 'zod/v4'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { ShopifyMappingData } from './CategoryShow'



interface Props {
    open: boolean
    onClose: () => void
    mapping: ShopifyMappingData | null
    onSave: (data: Omit<ShopifyMappingData, 'id'>, existingId?: number) => void
    isPending: boolean
}

export default function ShopifyMappingDialog({
    open,
    onClose,
    mapping,
    onSave,
    isPending,
}: Props) {
    const { t } = useTranslation()
    const isEdit = !!mapping?.id

    const schema = z.object({
        shopify_collection_gid: z
            .string()
            .min(1, t('Validation.required', { field: t('categories.shopify_collection_gid') }))
            .max(128)
            .regex(/^gid:\/\/shopify\/Collection\/\d+$/, {
                message: t('Validation.format', { format: 'gid://shopify/Collection/{id}', field: t('categories.shopify_collection_gid') }),
            }),
        shopify_collection_name: z.string().optional().or(z.literal('')),
        odoo_metaobject_gid: z
            .string()
            .min(1, t('Validation.required', { field: t('categories.odoo_metaobject_gid') }))
            .max(128)
            .regex(/^gid:\/\/shopify\/Metaobject\/\d+$/, {
                message: t('Validation.format', { format: 'gid://shopify/Metaobject/{id}', field: t('categories.odoo_metaobject_gid') }),
            }),
        odoo_category_name: z.string().optional().or(z.literal('')),
        is_active: z.boolean().default(true),
    })
    type FormData = z.infer<typeof schema>
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodFormResolver(schema),
        defaultValues: {
            shopify_collection_gid: '',
            shopify_collection_name: '',
            odoo_metaobject_gid: '',
            odoo_category_name: '',
            is_active: true,
        },
    })

    useEffect(() => {
        if (mapping) {
            reset({
                shopify_collection_gid: mapping.shopify_collection_gid || '',
                shopify_collection_name: mapping.shopify_collection_name || '',
                odoo_metaobject_gid: mapping.odoo_metaobject_gid || '',
                odoo_category_name: mapping.odoo_category_name || '',
                is_active: mapping.is_active ?? true,
            })
        } else {
            reset({
                shopify_collection_gid: '',
                shopify_collection_name: '',
                odoo_metaobject_gid: '',
                odoo_category_name: '',
                is_active: true,
            })
        }
    }, [mapping, reset])

    const onSubmit = (data: FormData) => {
        onSave(
            {
                shopify_collection_gid: data.shopify_collection_gid,
                shopify_collection_name: data.shopify_collection_name || '',
                odoo_metaobject_gid: data.odoo_metaobject_gid,
                odoo_category_name: data.odoo_category_name || '',
                is_active: data.is_active,
            },
            mapping?.id,
        )
    }

    const isActive = watch('is_active')

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit
                            ? t('categoryShow.edit_mapping', { defaultValue: 'Edit Shopify Mapping' })
                            : t('categoryShow.add_mapping', { defaultValue: 'Add Shopify Mapping' })}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Shopify Collection GID */}
                    <div className="space-y-2">
                        <Label>{t('categories.shopify_collection_gid')}</Label>
                        <Input
                            {...register('shopify_collection_gid')}
                            placeholder="gid://shopify/Collection/123456789"
                            dir="ltr"
                        />
                        {errors.shopify_collection_gid && (
                            <p className="text-xs text-destructive">{errors.shopify_collection_gid.message}</p>
                        )}
                    </div>

                    {/* Shopify Collection Name */}
                    <div className="space-y-2">
                        <Label>{t('categories.shopify_collection_name')}</Label>
                        <Input
                            {...register('shopify_collection_name')}
                            placeholder={t('categories.shopify_collection_name')}
                        />
                    </div>

                    {/* Odoo Metaobject GID */}
                    <div className="space-y-2">
                        <Label>{t('categories.odoo_metaobject_gid')}</Label>
                        <Input
                            {...register('odoo_metaobject_gid')}
                            placeholder="gid://shopify/Metaobject/987654321"
                            dir="ltr"
                        />
                        {errors.odoo_metaobject_gid && (
                            <p className="text-xs text-destructive">{errors.odoo_metaobject_gid.message}</p>
                        )}
                    </div>

                    {/* Odoo Category Name */}
                    <div className="space-y-2">
                        <Label>{t('categories.odoo_category_name')}</Label>
                        <Input
                            {...register('odoo_category_name')}
                            placeholder={t('categories.odoo_category_name')}
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between rounded-md border p-3">
                        <Label className="cursor-pointer">{t('Form.labels.active')}</Label>
                        <Switch
                            checked={isActive}
                            onCheckedChange={(v) => setValue('is_active', v)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('buttons.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isEdit
                                ? t('actions.update', { entity: '' }).trim()
                                : t('actions.create', { entity: '' }).trim()}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
