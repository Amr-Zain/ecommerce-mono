import { ColumnDef } from '@tanstack/react-table'
import {
    booleanControlColumn,
    DateColumn,
    imageColumn,
    textColumn,
} from '@/components/features/sharedColumns'
import { PickedAction } from '@/hooks/useStatusMutations'
import fallbackSrc from '@/assets/icons/placeholder.svg'
import { Switch } from '@ecommerce/ui/components/switch'
import { cn, hasPermission } from '@/lib/utils'
import { Badge } from '@ecommerce/ui/components/badge'
import { Filter, RowAction } from '@/types/components/table'
import { Link } from '@tanstack/react-router'
import { HasPermission } from '@/components/common/HasPermission'

export type ReviewEntity = {
    id: number
    user_name: string
    rating: number
    comment: string
    images: {
        id: number
        hash: string
        mime_type: string
        url: string
    }[]
    created_at: string
    is_active: boolean
    is_approved: boolean
    user: {
        id: number
        full_name: string
        email: string | null
        image: string | null
    }
    product: {
        id: number
        name: string
        image: {
            id: number
            hash: string
            mime_type: string
            url: string
        }
    }
}

export const reviewColumns = (
    t: (key: string) => string,
    open: (type: PickedAction | 'is_approved', row: ReviewEntity) => void,
): ColumnDef<ReviewEntity>[] => [
        imageColumn<ReviewEntity>('user.image' as any, 'Form.labels.image'),
        textColumn<ReviewEntity>('user_name', 'Form.labels.user_name'),
        textColumn<ReviewEntity>('comment', 'Form.labels.comment'),
        {
            id: 'images',
            header: () => <div className="text-start">{t('Form.labels.images')}</div>,
            cell: ({ row }) => {
                const images = row.original.images
                if (!images || images.length === 0) return <span className="text-xs text-muted-foreground">-</span>

                return (
                    <div className="flex gap-1">
                        {images.slice(0, 3).map((img) => (
                            <a
                                key={img.id}
                                href={img.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-shrink-0"
                            >
                                <img
                                    src={img.url}
                                    alt="Review"
                                    className="w-10 h-10 rounded object-cover ring-1 ring-border"
                                />
                            </a>
                        ))}
                        {images.length > 3 && (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{images.length - 3}
                            </div>
                        )}
                    </div>
                )
            },
        },
        textColumn<ReviewEntity>('rating', 'Form.labels.rating', {
            render: (info) => {
                const rating = info.getValue() as number
                return (
                    <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{rating}</span>
                    </div>
                )
            },
        }),
        textColumn<ReviewEntity>('product', 'common.product', {
            render: (info) => {
                const product = info.getValue() as ReviewEntity['product']
                return (
                    product && <Link to={`/products/show/$id`} params={{ id: product?.id?.toString() }} className="flex items-center gap-2 hover:underline min-w-[120px]">
                        <img
                            src={String((product.image as any)?.url! ?? product.image)}
                            alt="page"
                            className="size-12 rounded-full border border-border"
                            onError={(e) => (e.currentTarget.src = fallbackSrc)}
                        />
                        <span className="line-clamp-2">{product.name}</span>
                    </Link>
                )
            }
        }),
        booleanControlColumn<ReviewEntity>('is_active', 'table.status', open as any, 'active', false, 'reviews'),
        textColumn<ReviewEntity>('is_approved' as any, 'table.is_approved', {
            render: ({ row, getValue }) => {
                const isApproved = Boolean(getValue());
                const canUpdate = hasPermission('reviews', 'update');

                if (!canUpdate) {
                    return (
                        <div className="flex items-center gap-2 max-w-fit">
                            <Badge variant={isApproved ? 'default' : 'destructive'}>
                                <div>
                                    {isApproved ? t('status.enabled') : t('status.disabled')}
                                </div>
                            </Badge>
                        </div>
                    );
                }

                return (
                    <HasPermission entity="reviews" action="update">
                        <div
                            className={cn("flex items-center gap-2 max-w-fit", !isApproved && "cursor-pointer")}
                            onClick={(e) => {
                                if (isApproved) return;
                            e.stopPropagation();
                            open('is_approved' as any, row.original);
                        }}
                    >
                        <Switch checked={isApproved} disabled={isApproved} />
                        <Badge variant={isApproved ? 'default' : 'destructive'}>
                            <div>
                                {isApproved ? t('status.enabled') : t('status.disabled')}
                            </div>
                        </Badge>
                    </div>
                    </HasPermission>
                );
            }
        }),
        DateColumn<ReviewEntity>('created_at', 'table.createdAt'),
    ]

export const reviewActions = (
    t: (key: string) => string,
    open: (type: PickedAction | 'is_approved', row: ReviewEntity) => void,
    navigate: (options: any) => void,
) => [
    {
        label: t('actions.show'),
        onClick: (row: ReviewEntity) => navigate({ to: `/reviews/show/${row.id}` }),
        permission: 'reviews',
        action: 'show',
    },
    {
        label: t('actions.delete'),
        danger: true,
        onClick: (row: ReviewEntity) => open('delete', row),
        permission: 'reviews',
        action: 'destroy',
    },
    {
        label: (row: ReviewEntity) =>
            t(`actions.${row.is_active ? 'deactivate' : 'activate'}`),
        onClick: (row: ReviewEntity) => open('active', row),
        permission: 'reviews',
        action: 'update',
    },
    // Show verification action but disable if already approved
    {
        label: (row: ReviewEntity) =>
            t(`actions.${row.is_approved ? 'unverify' : 'verify'}`),
        onClick: (row: ReviewEntity) => open('is_approved', row),
        disabled: (row: ReviewEntity) => Boolean(row.is_approved),
        permission: 'reviews',
        action: 'update',
    },
] as RowAction<ReviewEntity>[]


export const getReviewFilters = (t: (key: string) => string): Filter[] => [
    // {
    //     id: 'filters[user_id]',
    //     title: t('Form.labels.user_id'),
    //     options: [],
    //     // placeholder: t('Form.placeholders.user_id'), // Removed if not supported
    //     multiple: false,
    // },
    {
        id: 'filters[productId]',
        title: t('Form.labels.product'),
        endpoint: 'products?paginate=0',
        select: (res: any) => res.data.map((item: any) => ({ label: item.name, value: item.id })),
        // placeholder: t('Form.placeholders.product_id'), // Removed if not supported
        multiple: false,
    },
    {
        id: 'filters[rating]',
        title: t('Form.labels.rating'),
        options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
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
