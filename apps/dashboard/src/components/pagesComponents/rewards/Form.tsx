import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { rewardsQueryKeys } from '@/util/queryKeysFactory'
import { Reward } from '@/types/api/earningRules'
import { buildRewardFields, RewardFormData } from './Config'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
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
            data.reward_value &&
            +data.reward_value >= 100
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
            is_active: reward ? (reward.is_active ? '1' : '0') : ('1' as any),
        },
        mode: 'onChange',
    })

    const fields = buildRewardFields(t)

    const { mutate, isPending } = useMutate({
        endpoint: reward ? `rewards/${reward.id}` : 'rewards',
        mutationKey: rewardsQueryKeys.getReward(String(reward?.id ?? 'new')),
        mutationOptions: {
            meta: {
                invalidates: [
                    rewardsQueryKeys.all(),
                    rewardsQueryKeys.getReward(String(reward?.id ?? 'new')),
                ],
            },
        },
        method: reward?.id ? 'patch' : 'post',
        onSuccess: (data: ApiResponse) => {
            toast.success(data.message)
            navigate({ to: '/rewards' } as any)
        },
        onError: (_e, normalized) => toast.error(normalized.message),
    })

    const handleSubmit = (values: RewardFormData) => {
        console.log(values)
        const finalOut = generateFinalOut(reward, values)
        mutate(finalOut as any)
    }

    return (
        <AppForm<RewardFormData>
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
                reward
                    ? t('actions.update', { entity: t('rewards.entity') })
                    : t('actions.create', { entity: t('rewards.entity') })
            }
        />
    )
}
