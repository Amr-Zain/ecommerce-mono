import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/util/queryKeysFactory'
import { EarningRule } from '@/types/api/earningRules'
import { buildEarningRuleFields, EarningRuleFormData } from './Config'
import { useForm } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { makeEarningRuleSchema } from '@/lib/schema'

const normalizeImageValue = (image?: EarningRule['image']) => {
    if (!image) return undefined
    if (typeof image === 'object') return image

    return {
        id: image,
        hash: image,
        mime_type: 'image/jpeg',
        url: image,
    }
}


export default function EarningRuleForm({
    earningRule,
}: {
    earningRule?: EarningRule
}) {
    const { t } = useTranslation()

    const schema = makeEarningRuleSchema(t)

    const form = useForm<EarningRuleFormData>({
        resolver: zodFormResolver(schema),
        defaultValues: {
            ...generateInitialValues(earningRule),
            image: normalizeImageValue(earningRule?.image),
            points_type: earningRule?.points_type ?? 'fixed',
            points_value: earningRule?.points_value ?? ('' as any),
            min_order_amount: earningRule?.min_order_amount ?? '',
            event_key: earningRule?.event_key ?? '',
            is_active: earningRule
                ? (earningRule.is_active ? '1' : '0')
                : ('1' as any),
        },
        mode: 'onChange',
    })

    const fields = buildEarningRuleFields(t, earningRule?.event_key ?? '')

    const { mutate, isPending } = useMutate({
        endpoint: earningRule ? `earning-rules/${earningRule.id}` : 'earning-rules',
        mutationKey: queryKeys.earningRules.getEarningRule(
            String(earningRule?.id ?? 'new'),
        ),
        invalidates: [
            queryKeys.earningRules.all(),
            queryKeys.earningRules.getEarningRule(String(earningRule?.id ?? 'new')),
        ],
        method: earningRule?.id ? 'patch' : 'post',
        redirectTo: '/earning-rules',
    })

    const handleSubmit = (values: EarningRuleFormData) => {
        const finalOut = generateFinalOut(earningRule, values)
        if(typeof finalOut.image === 'string' && finalOut.image.startsWith('http')){
            delete finalOut.image
        }
        // image is handled the same way as product.image via generateFinalOut :contentReference[oaicite:3]{index=3}
        mutate(finalOut)
    }

    return (
        <AppForm<EarningRuleFormData>
            schema={schema as any}
            fields={fields}
            providedForm={form as any}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            className="bg-card border border-border rounded-lg shadow-sm"
            formClassName="p-6"
            submitButtonText={
                earningRule
                    ? t('actions.update', { entity: t('earningRules.entity') })
                    : t('actions.create', { entity: t('earningRules.entity') })
            }
        />
    )
}
