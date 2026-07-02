import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { buildRewardFields } from './Config'
import type { Reward } from '@/types/api/earningRules'
import type { RewardFormData } from './Config';
import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import { zodFormResolver } from '@/lib/schema/resolver'
import { positiveNumber, stringOrUidHashObject, zodString } from '@/lib/schema/validation'

const makeRewardSchema = (t: any) =>
    z.object({
        points_required: z
            .coerce
            .number()
            .int()
            .positive(),
        reward_type: zodString.min(1),
        reward_value: positiveNumber.int(),
        max_discount_amount: z.coerce.number().min(0).optional().nullable(),
        min_order_amount: z.coerce.number().min(0).optional().nullable(),
        usage_limit: z.coerce.number().int().min(1).optional().nullable(),
        per_user_limit: z.coerce.number().int().min(1).optional().nullable(),
        is_active: z.enum(['1', '0']).optional().nullable(),
        image: stringOrUidHashObject(t, { required: true }),
        name_ar: zodString.min(1),
        name_en: zodString.min(1),
        description_ar: zodString.min(1),
        description_en: zodString.min(1),
    }).superRefine((data, ctx) => {
        if (
            (!data.reward_type && data.reward_value) ||
            (data.reward_type && !data.reward_value)
        ) {
            ctx.addIssue({
                code: 'custom',
                message: t('Validation.requiredSimple'),
                path: ['reward_value'],
            })
        }
        if (
            data.reward_type === 'percentage' &&
            (!data.max_discount_amount || +data.max_discount_amount <= 0)
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['max_discount_amount'],
                message: t('Validation.requiredSimple'),
            })
        }
        if (
            data.reward_type === 'percentage' &&
            data.reward_value &&
            +data.reward_value > 100
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['reward_value'],
                message: t('Validation.percentageUnder100'),
            })
        }
        // if (
        //     data.reward_type === 'fixed' &&
        //     data.reward_value &&
        //     +data.reward_value >= +data.points_required
        // ) {
        //     ctx.addIssue({
        //         code: 'custom',
        //         path: ['reward_value'],
        //         message: t('Validation.rewardValueMustBeLessThanPointsRequired'),
        //     })
        // }
    })

export default function RewardForm({ reward }: { reward?: Reward }) {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const schema = makeRewardSchema(t)

    const form = useForm<RewardFormData>({
        resolver: zodFormResolver(schema),
        defaultValues: {
            ...generateInitialValues(reward),
            points_required: reward?.points_required ?? ('' as any),
            reward_type: reward?.reward_type ?? 'percentage',
            reward_value: reward?.reward_value ?? ('' as any),
            max_discount_amount: reward?.max_discount_amount ?? ('' as any),
            min_order_amount: reward?.min_order_amount ?? ('' as any),
            usage_limit: reward?.usage_limit ?? ('' as any),
            per_user_limit: reward?.per_user_limit ?? 1,
            is_active: reward ? (reward.is_active ? '1' : '0') : ('1'),
        },
        mode: 'onChange',
    })

    const fields = buildRewardFields(t)

    const { mutate, isPending } = useMutate({
        endpoint: reward ? `rewards/${reward.id}` : 'rewards',
        mutationKey: queryKeys.rewards.getReward(String(reward?.id ?? 'new')),
        invalidates: [
            queryKeys.rewards.all(),
            queryKeys.rewards.getReward(String(reward?.id ?? 'new')),
        ],
        method: reward?.id ? 'patch' : 'post',
        redirectTo: '/rewards',
    })

    const handleSubmit = (values: RewardFormData) => {
        const finalOut = generateFinalOut(reward, values)
        ;(['max_discount_amount', 'min_order_amount', 'usage_limit', 'per_user_limit'] as const).forEach((key) => {
            if (finalOut[key] === '') finalOut[key] = null
        })
        mutate(finalOut)
    }

    return (
        <AppForm<RewardFormData>
            schema={schema}
            fields={fields}
            providedForm={form as any}
            onSubmit={handleSubmit}
            isLoading={isPending}
            gridColumns={2}
            spacing="md"
            className="bg-card border border-border rounded-lg shadow-sm"
            formClassName="p-6"
            submitButtonText={
                reward
                    ? t('actions.update', { entity: t('rewards.entity') })
                    : t('actions.create', { entity: t('rewards.entity') })
            }
        />
    )
}
