import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  DateColumn,
  imageColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import { productsQueryKeys, slidersQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { FieldProp } from '@/types/components/form'
import { SliderFormData } from '@/lib/schema'
import { TFn } from '@/lib/schema/validation'
import { Dialog, DialogContent, DialogHeader } from '@ecommerce/ui/components/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Video } from 'lucide-react'
import ImageWithPreview from '@/components/common/uiComponents/image/ImagePreview'
import MultiSelectProducts from './MultiSelectProducts'

export type Slider = {
  id: string
  title?: string
  sort_order?: number
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  created_at: string
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

export const sliderColumns = (
  open: (type: PickedAction, row: Slider) => void,
  t: TFn,
): ColumnDef<Slider>[] => [
    imageColumn<Slider>('slide', 'table.columns.attachment', {
      render: (ctx) => {
        const media = ctx.getValue() as Slider['slide']
        if (!media) return '-'
        return media?.mime_type?.startsWith('image') ? (
          <ImageWithPreview
            src={media.path}
            alt="slide"
            className="size-12 rounded-full border border-border"
          />
        ) : (
          <Dialog>
            <DialogTrigger className="cursor-pointer">
              <Video className="size-11 text-purple-500" />
            </DialogTrigger>
            <DialogContent className="bg-transparent !w-[90vw] justify-center p-6 md:p-12 max-w-xl border-none">
              <video controls style={{ width: '100%' }}>
                <source src={media.path} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </DialogContent>
          </Dialog>
        )
      },
    }),
    textColumn<Slider>('title', 'table.columns.title'),
    booleanControlColumn<Slider>('is_active', 'table.status', open, 'active', false, 'sliders'),
    DateColumn<Slider>('start_date', 'table.columns.startAt'),
    DateColumn<Slider>('end_date', 'table.columns.endAt'),
    DateColumn<Slider>('created_at', 'table.createdAt'),
  ]

export const sliderActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Slider) => void,
) =>
  [
    {
      label: t('actions.edit'),
      to: '/sliders/edit/$id',
      params: (row: Slider) => ({ id: String(row.id) }),
      permission: 'sliders',
      action: 'update',
      queryKey: (id: string) => slidersQueryKeys.getSlider(id),
    },
    {
      label: t('actions.delete'),
      danger: true,
      onClick: (row: Slider) => open('delete', row),
      permission: 'sliders',
      action: 'destroy',
    },
    {
      label: (row: Slider) =>
        t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
      onClick: (row: Slider) => open('active', row),
      permission: 'sliders',
      action: 'update',
    },
  ] as RowAction<Slider>[]

export const getSliderFilters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[isActive]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'sort[createdAt]',
    title: t('sort.title'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
  /*   {
    id: 'sort[sort_order]',
    title: t('sort.createdAt'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  }, */
]
const now = new Date()
const yesterdayUTC = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
)
export function buildSliderFields(
  t: (k: string) => string,
  modelId?: string | number,
): FieldProp<SliderFormData>[] {
  return [
    {
      type: 'mediaUploader',
      name: 'slide',
      label: t('table.columns.attachment'),
      span: 2,
      inputProps: {
        maxFiles: 1,
        acceptedFileTypes: ['video/*', 'image/*'],
        apiEndpoint: '/media/upload',
        model: 'slider',
        modelId,
        baseUrl: import.meta.env.VITE_BASE_URL_API,
        maxSize: 10,
      },
    },
    // {
    //   type: 'select',
    //   name: 'discount_type',
    //   label: t('Form.labels.discountType'),
    //   inputProps: {
    //     options: [
    //       { label: t('Form.options.fixed'), value: 'fixed' },
    //       { label: t('Form.options.percentage'), value: 'percentage' },
    //     ],
    //     placeholder: t('Form.placeholders.discountType'),
    //   },
    // },
    // {
    //   type: 'number',
    //   name: 'discount_value',
    //   label: t('Form.labels.discountValue'),
    //   placeholder: '50',
    // },
    {
      type: 'date',
      name: 'start_date',
      label: t('Form.labels.startAt'),
      // placeholder: t('Form.labels.startAt'),
      inputProps: {
        disabledDates: { from: new Date(-1), to: yesterdayUTC },
      },
    },
    {
      type: 'date',
      name: 'end_date',
      label: t('Form.labels.endAt'),
      // placeholder: t('Form.labels.endAt'),
      inputProps: {
        disabledDates: { from: new Date(-1), to: new Date() },
      },
    },
    {
      type: 'multiLangField',
      name: 'title' as any,
      label: t('Form.labels.title'),
      placeholder: t('Form.placeholders.name'),
      span: 2,
    },
    {
      type: 'number',
      name: 'sort_order' as any,
      label: t('Form.labels.sortOrder'),
      // placeholder: t('Form.placeholders.sortOrder'),
      span: 1,
    },
    /* {
      type: 'select',
      name: 'products',
      label: t('Form.labels.products'),
      inputProps: {
        endpoint: 'products',
        select: (data: any) =>
          (data.data as any[]).map((p) => ({
            label: p.name,
            value: String(p.id),
          })),
        queryKey: productsQueryKeys.all(),
        placeholder: t('Form.placeholders.products'),
        multiple: true,
      },

      span: 2,
    }, */
    // {
    //   type: 'custom',
    //   name: 'products',
    //   label: t('Form.labels.products'),
    //   customItem: <MultiSelectProducts />,
    //   span: 2,
    // },
    {
      type: 'checkbox',
      name: 'is_active',
      label: t('Form.labels.isActive'),
      span: 2,
    },
  ]
}
