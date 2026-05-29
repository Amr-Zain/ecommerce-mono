import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { tiersQueryKeys } from '@/util/queryKeysFactory'
import { buildTierFields, Tier, TierFormData } from './Config'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodFormResolver } from '@/lib/schema/resolver'
import { stringOrUidHashObject } from '@/lib/schema/validation'

const makeTierSchema = (t: any) =>
    z.object({
        multiplier: z
            .coerce
            .number({ message: t('Validation.requiredSimple') })
            .positive({ message: t('Validation.positive') }).max(2, { message: t('Validation.max_two', { field: t('Form.labels.multiplier') }) }),
        min_lifetime_points: z
            .coerce
            .number({ message: t('Validation.requiredSimple') })
            .min(0, { message: t('Validation.min_zero') }),
        is_active: z.enum(['1', '0']).optional().nullable(),
        icon: stringOrUidHashObject(t),
        name_ar: z.string().min(1, { message: t('Validation.requiredSimple') }),
        name_en: z.string().min(1, { message: t('Validation.requiredSimple') }),
        color: z.string().min(1, { message: t('Validation.requiredSimple') }),
    })

export default function TierForm({ tier }: { tier?: Tier }) {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const schema = makeTierSchema(t)

    const form = useForm<TierFormData>({
        resolver: zodFormResolver(schema),
        defaultValues: {
            ...generateInitialValues(tier),
            multiplier: tier?.multiplier ?? ('' as any),
            min_lifetime_points: tier?.min_lifetime_points ?? ('' as any),
            is_active: tier ? (tier.is_active ? '1' : '0') : ('1' as any),
            icon: tier?.icon || null,
            color: tier?.color || ('' as any),
        },
        mode: 'onChange',
    })

    const fields = buildTierFields(t)

    const { mutate, isPending } = useMutate({
        endpoint: tier ? `tiers/${tier.id}` : 'tiers',
        mutationKey: tiersQueryKeys.getTier(String(tier?.id ?? 'new')),
        mutationOptions: {
            meta: {
                invalidates: [
                    tiersQueryKeys.all(),
                    tiersQueryKeys.getTier(String(tier?.id ?? 'new')),
                ],
            },
        },
        method: tier?.id ? 'patch' : 'post',
        onSuccess: (data: ApiResponse) => {
            toast.success(data.message)
            navigate({ to: '/tiers' } as any)
        },
        onError: (_e, normalized) => toast.error(normalized.message),
    })

    const handleSubmit = (values: TierFormData) => {
        const finalOut = generateFinalOut(tier, values)
        mutate(finalOut as any)
    }

    return (
        <AppForm<TierFormData>
            schema={schema as any}
            fields={fields as any}
            providedForm={form as any}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            className="bg-card border border-border rounded-lg shadow-sm"
            formClassName="p-6"
            submitButtonText={
                tier
                    ? t('actions.update', { entity: t('tiers.entity') })
                    : t('actions.create', { entity: t('tiers.entity') })
            }
        />
    )
}
