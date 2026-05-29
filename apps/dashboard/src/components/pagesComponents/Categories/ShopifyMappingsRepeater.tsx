import * as React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import Field from '@/components/common/form/Field'
import { Button } from '@ecommerce/ui/components/button'
import { CategoryFormData } from '@/lib/schema'
import { Plus, Trash2 } from 'lucide-react'

const ShopifyMappingsRepeater: React.FC<{ t: (k: string) => string }> = ({
    t,
}) => {
    const { control } = useFormContext<CategoryFormData>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'shopify_mappings',
    })

    const addRow = () =>
        append({
            shopify_collection_gid: '',
            shopify_collection_name: '',
            odoo_metaobject_gid: '',
            odoo_category_name: '',
            is_active: true,
        })

    return (
        <div className="col-span-2 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">
                    {t('categories.shopify_mappings')}
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="me-1 h-4 w-4" />
                    {t('actions.add')}
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((f, idx) => (
                    <div
                        key={f.id}
                        className="grid grid-cols-2 gap-3 items-start rounded-md border p-4"
                    >
                        <Field
                            type="text"
                            control={control}
                            name={`shopify_mappings.${idx}.shopify_collection_gid` as any}
                            label={t('categories.shopify_collection_gid')}
                            placeholder="gid://shopify/Collection/..."
                        />

                        <Field
                            type="text"
                            control={control}
                            name={`shopify_mappings.${idx}.shopify_collection_name` as any}
                            label={t('categories.shopify_collection_name')}
                            placeholder={t('categories.shopify_collection_name')}
                        />

                        <Field
                            type="text"
                            control={control}
                            name={`shopify_mappings.${idx}.odoo_metaobject_gid` as any}
                            label={t('categories.odoo_metaobject_gid')}
                            placeholder="gid://shopify/Metaobject/..."
                        />

                        <Field
                            type="text"
                            control={control}
                            name={`shopify_mappings.${idx}.odoo_category_name` as any}
                            label={t('categories.odoo_category_name')}
                            placeholder={t('categories.odoo_category_name')}
                        />

                        <div className="col-span-2 flex items-center justify-between">
                            <Field
                                type="switch"
                                control={control}
                                name={`shopify_mappings.${idx}.is_active` as any}
                                label={t('Form.labels.active')}
                            />

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => remove(idx)}
                            >
                                <Trash2 className="me-1 h-4 w-4" />
                                {t('actions.delete')}
                            </Button>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                        {t('categories.no_shopify_mappings')}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShopifyMappingsRepeater
