import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/api/http'
import { useNavigate } from '@tanstack/react-router'
import { formDateToYYYYMMDD, generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { slidersQueryKeys } from '@/util/queryKeysFactory'
import { makeSliderSchema, SliderFormData } from '@/lib/schema'
import { buildSliderFields } from './Config'
export type SliderEntity = {
  id: string
  title?: string
  sort_order?: number
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
  slide?: {
    uuid: string
    path: string
    mime_type?: string
    type?: string
    original_name?: string
  } | null
  en?: { id?: string; title?: string }
  ar?: { id?: string; title?: string }
}

export default function SliderForm({ slider }: { slider?: SliderEntity }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const schema = makeSliderSchema(t)
  const fields = buildSliderFields(t, slider?.id)

  const { mutate, isPending } = useMutate({
    endpoint: slider ? `sliders/${slider.id}` : 'sliders',
    mutationKey: slidersQueryKeys.getSlider(String(slider?.id ?? 'new')),
    mutationOptions: {
      meta: {
        invalidates: [
          slidersQueryKeys.all(),
        ],
      },
    },
    method: slider?.id ? 'patch' : 'post',
    onSuccess: (data: ApiResponse) => {
      toast.success(data.message)
      navigate({ to: '/sliders' } as any)
    },
    onError: (_e, normalized) => toast.error(normalized.message),
  })

  const handleSubmit = (values: SliderFormData) => {
    const finalOut = generateFinalOut(slider, values)  
    if (slider) {
      if (typeof values.slide === 'object') {
        delete finalOut.slide
      }
    }
    mutate({
      ...finalOut,
      start_date: formDateToYYYYMMDD(values.start_date),
      end_date: formDateToYYYYMMDD(values.end_date),
      is_active: finalOut.is_active,
    })
  }

  return (
    <AppForm<SliderFormData>
      schema={schema as any}
      fields={fields}
      defaultValues={{
        ...generateInitialValues(slider),
        start_date: slider?.start_date ? new Date(slider.start_date) : undefined,
        end_date: slider?.end_date ? new Date(slider.end_date) : undefined,
        is_active: slider?.is_active ?? false,
      }}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        slider
          ? t('actions.update', { entity: t('common.slider') })
          : t('actions.create', { entity: t('common.slider') })
      }
    />
  )
}
