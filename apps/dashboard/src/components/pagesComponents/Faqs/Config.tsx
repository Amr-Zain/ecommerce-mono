// src/routes/_main/settings/faqs/config.tsx
import { ColumnDef } from '@tanstack/react-table'
import {
  booleanControlColumn,
  createdAtColumn,
  DateColumn,
  textColumn,
} from '@/components/features/sharedColumns'
import { FieldProp } from '@/types/components/form'
import { Faq, FAQ_TYPE_OPTIONS, displayFaqType } from '@/types/api/faq'
import { FaqFormData } from '@/lib/schema'
import { PickedAction } from '@/hooks/useStatusMutations'
import { faqQueryKeys } from '@/util/queryKeysFactory'
import { Filter, RowAction } from '@/types/components/table'
import { TFn } from '@/lib/schema/validation'

export const buildFaqFields = (
  t: (k: string) => string,
): FieldProp<FaqFormData>[] => [
    // {
    //   type: 'select',
    //   name: 'type',
    //   label: t('Form.labels.type'),
    //   inputProps: {
    //     options: FAQ_TYPE_OPTIONS.map((o) => ({
    //       label: t(`faq.types.${o.label}`),
    //       value: o.value,
    //     })),
    //     placeholder: t('Form.placeholders.type'),
    //   },
    // },
    /*   {
        type: 'switch',
        name: 'is_active',
        label: t('Form.labels.status'),
        inputProps: {
          trueText: t('status.active'),
          falseText: t('status.inactive'),
        },
        span: 1,
      }, */
    {
      type: 'multiLangField',
      name: 'question' as any,
      label: t('Form.labels.question'),
      placeholder: t('Form.placeholders.question'),
      span: 2,
    },
    {
      type: 'multiLangField',
      name: 'answer' as any,
      label: t('Form.labels.answer'),
      placeholder: t('Form.placeholders.answerEn'),
      inputProps: {
        type: "editor"
      },
      span: 2,
    },
  ]

export const faqColumns = (
  open: (type: PickedAction, row: Faq) => void,
  t: TFn,
): ColumnDef<Faq>[] => [
    textColumn<Faq>('question', 'table.columns.question', {
      render: ({ row }) => (
        <p className="line-clamp-1">{row.original.question}</p>
      ),
    }),
    textColumn<Faq>('answer', 'table.columns.answer', {
      render: ({ row }) => (
        <p className="line-clamp-1" dangerouslySetInnerHTML={{ __html: row.original.answer || "" }} />
      ),
    }),
    // textColumn<Faq>('type', 'table.columns.type', {
    //   render: ({ row }) => <p className='whitespace-nowrap'>{t(`faqs.${row.original.type}`)}</p>,
    // }),
    booleanControlColumn<Faq>('is_active', 'table.status', open, 'active', false, 'faqs'),
    DateColumn<Faq>('created_at', 'table.createdAt'),
  ]

export const faqActions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Faq) => void,
) => [
  {
    label: t('actions.editFaq'),
    to: '/faqs/edit/$id',
    params: (row: Faq) => ({ id: String(row.id) }),
    permission: 'faqs',
    action: 'update',
    queryKey: (id: string) => faqQueryKeys.getFaq(id),
  },
  {
    label: t('actions.delete'),
    danger: true,
    onClick: (row: Faq) => open('delete', row),
    permission: 'faqs',
    action: 'destroy',
  },
  {
    label: (row: Faq) =>
      t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
    onClick: (row: Faq) => open('active', row),
    permission: 'faqs',
    action: 'update',
  },
] as RowAction<Faq>[]

export const getFaqFilters = (t: (key: string) => string): Filter[] => [
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
]
