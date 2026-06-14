import * as React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/util/helpers'
import type { ReviewEntity } from '../../Reviews/Config'
import { Alert, AlertDescription, AlertTitle } from '@ecommerce/ui/components/alert'
import { Link, useNavigate } from '@tanstack/react-router'
import { DataTable } from '@/components/common/table/AppTable'
import { ColumnDef } from '@tanstack/react-table'
import { textColumn, DateColumn } from '@/components/features/sharedColumns'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'
import type { ApiResponse } from '@/types/api/http'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { reviewActions } from '../../Reviews/Config'
import { RowActions } from '@/components/common/table/RowActions'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarImage, AvatarFallback } from '@ecommerce/ui/components/avatar'

type Props = {
    productId: number
}

const getReviewColumns = (t: (key: string) => string): ColumnDef<ReviewEntity>[] => [
    {
        id: 'user',
        header: () => <div className="text-start">{t('Form.labels.user_name')}</div>,
        cell: ({ row }) => {
            const review = row.original
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border shadow-sm">
                        {review.user?.image && <AvatarImage src={review.user.image} alt={review.user_name} />}
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                            {review.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{review.user_name}</span>
                </div>
            )
        },
    },
    {
        id: 'rating',
        header: () => <div className="text-start">{t('Form.labels.rating')}</div>,
        cell: ({ row }) => {
            const rating = row.original.rating
            return (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'w-3.5 h-3.5',
                                i < rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            )}
                        />
                    ))}
                    <span className="ml-1 text-sm font-medium">({rating})</span>
                </div>
            )
        },
    },
    textColumn<ReviewEntity>('comment', 'Form.labels.comment', {
        render: (ctx) => (
            <div className="max-w-md text-sm text-muted-foreground line-clamp-2">
                {ctx.getValue()}
            </div>
        ),
    }),
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
    {
        id: 'status',
        header: () => <div className="text-start">{t('table.status')}</div>,
        cell: ({ row }) => {
            const review = row.original
            return (
                <div className="flex flex-col gap-1">
                    <Badge variant={review.is_approved ? 'default' : 'secondary'} className="text-xs w-fit">
                        {review.is_approved ? t('status.approved') : t('status.pending')}
                    </Badge>
                    {review.is_active && (
                        <Badge variant="outline" className="text-xs w-fit">
                            {t('status.active')}
                        </Badge>
                    )}
                </div>
            )
        },
    },
    DateColumn<ReviewEntity>('created_at', 'table.createdAt'),
]

export function ProductReviewsCard({ productId }: Props) {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const queryClient = useQueryClient()
    const [selected, setSelected] = React.useState<{
        id: string
        type: PickedAction | 'is_approved' // We handle custom action
        isActive?: boolean
        isApproved?: boolean
    } | null>(null)

    const currentId = selected?.id || ''

    const { mutateAsync: changeActive, isPending: activePending } =
        useStatusMutation(
            currentId,
            'active',
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.all()],
        )

    const { mutateAsync: changeDelete, isPending: deletePending } =
        useStatusMutation(
            currentId,
            'delete',
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.all()],
        )

    const { mutateAsync: changeApproved, isPending: approvedPending } =
        useStatusMutation(
            currentId,
            'active', // We reuse 'active' to get PUT method
            'reviews',
            queryKeys.reviews.getReview(currentId),
            [queryKeys.reviews.all()]
        )

    React.useEffect(() => {
        alert.setPending(activePending || deletePending || approvedPending)
    }, [activePending, deletePending, approvedPending])

    const openAlert = (type: PickedAction | 'is_approved', row: ReviewEntity) => {
        setSelected({
            id: String(row.id),
            type,
            isActive: row.is_active,
            isApproved: row.is_approved
        })

        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !row.is_active })
            } else if (type === 'delete') {
                await changeDelete({})
            } else if (type === 'is_approved') {
                await changeApproved({ is_approved: !row.is_approved })
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() })
            alert.setIsOpen(false)
        }

        const { title, desc } = getModalTitle(type as any, 'review', t)
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title,
            desc,
            pending: activePending || deletePending || approvedPending,
            handleConfirm: handler,
        })
        alert.setHandler(handler)
    }


    const { data: reviewsData, isPending } = useFetch<ApiResponse<ReviewEntity[], 'reviews'>>({
        queryKey: queryKeys.reviews.filterd({ 'filters[product_id]': String(productId) }),
        endpoint: 'reviews?paginate=1',
        params: { 'filters[product_id]': productId },
    })

    const navigate = useNavigate()

    const reviews = reviewsData?.data?.reviews || []

    const columns = React.useMemo(() => getReviewColumns(t), [t])

    if (isPending) return <div className='h-40 flex items-center justify-center'>{t('buttons.loading')}</div>

    if (!reviews || reviews.length === 0) {
        return (
            <Card className="shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{t('productShow.reviews')}</CardTitle>
                            <CardDescription>
                                {t('common.review')} (0)
                            </CardDescription>
                        </div>
                        <Link to="/reviews" search={{ 'filters[product_id]': productId.toString() } as any}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                                {t('actions.viewAll')}
                            </Badge>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle>{t('Text.noResults')}</AlertTitle>
                        <AlertDescription>
                            {t('productShow.noReviews')}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('productShow.reviews')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('common.review')} ({reviews.length})
                    </p>
                </div>
                <Link to="/reviews" search={{ 'filters[product_id]': productId.toString() } as any}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                        {t('actions.viewAll')}
                    </Badge>
                </Link>
            </div>

            <DataTable
                data={reviews}
                columns={columns}
                rowUrl={(row)=>`/reviews/show/${row.id}`}
                actions={RowActions({
                    actions: reviewActions(t, openAlert, navigate),
                    menuLabel: t('actions.entity'),
                })}
            />
        </div>
    )
}

export default ProductReviewsCard
