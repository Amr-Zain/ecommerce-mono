import * as React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@ecommerce/ui/components/button'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@ecommerce/ui/components/input'
import { FormControl, FormItem, FormLabel, FormMessage } from '@ecommerce/ui/components/form'

const ScopesRepeater: React.FC<{ t: (k: string) => string }> = ({ t }) => {
    const { control, register } = useFormContext<any>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'settings.scopes',
    })

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                    {t('Form.labels.scopes')}
                </FormLabel>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append('')}
                >
                    <Plus className="me-1 h-4 w-4" />
                    {t('actions.add')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map((field, index) => (
                    <FormItem key={field.id} className="relative">
                        <div className="flex items-center gap-2">
                            <FormControl>
                                <Input
                                    {...register(`settings.scopes.${index}`)}
                                    placeholder={t('Form.placeholders.scope')}
                                />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {t('Form.messages.no_scopes')}
                </div>
            )}
        </div>
    )
}

export default ScopesRepeater
