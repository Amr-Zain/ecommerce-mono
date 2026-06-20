import { Review } from "@/types/api/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@ecommerce/ui/components/avatar";
import {
    StarIcon,
    Calendar01Icon,
    User02Icon,
    Package01Icon,
    Shield01Icon,
    Alert01Icon,
    EyeIcon,
    Message01Icon,
    Link01Icon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Delete01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@ecommerce/ui/components/button";
import { useStatusMutation } from "@/hooks/useStatusMutations";
import { queryKeys } from '@/util/queryKeysFactory'
;
import { useAlertModal } from "@/stores/useAlertModal";
import { getModalTitle } from "@/util/helpers";
import { ShowHeader, EntityLinkCard } from "@/components/common/show";

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={icon} {...props} />
)
const Star = H(StarIcon)
const Calendar = H(Calendar01Icon)
const User = H(User02Icon)
const Package = H(Package01Icon)
const ShieldCheck = H(Shield01Icon)
const ShieldAlert = H(Alert01Icon)
const Eye = H(EyeIcon)
const MessageSquare = H(Message01Icon)
const ExternalLink = H(Link01Icon)
const CheckCircle = H(CheckmarkCircle01Icon)
const XCircle = H(Cancel01Icon)
const Trash2 = H(Delete01Icon)

interface ReviewShowProps {
    review: Review;
}

export default function ReviewShow({ review }: ReviewShowProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const alert = useAlertModal();
    const reviewId = String(review.id);

    const { mutateAsync: changeActive, isPending: activePending } = useStatusMutation(
        reviewId,
        'active',
        'reviews',
        queryKeys.reviews.getReview(reviewId),
        [queryKeys.reviews.all()]
    );

    const { mutateAsync: changeDelete, isPending: deletePending } = useStatusMutation(
        reviewId,
        'delete',
        'reviews',
        queryKeys.reviews.getReview(reviewId),
        [queryKeys.reviews.all()]
    );

    const { mutateAsync: changeApproved, isPending: approvedPending } = useStatusMutation(
        reviewId,
        'active',
        'reviews',
        queryKeys.reviews.getReview(reviewId),
        [queryKeys.reviews.all()]
    );

    const handleAction = (type: 'active' | 'delete' | 'is_approved') => {
        const handler = async () => {
            if (type === 'active') {
                await changeActive({ is_active: !review.is_active });
            } else if (type === 'delete') {
                await changeDelete({});
                navigate({ to: '/reviews' } as any);
            } else if (type === 'is_approved') {
                await changeApproved({ is_approved: !review.is_approved });
            }
            alert.setIsOpen(false);
        };

        const { title, desc } = getModalTitle(type === 'is_approved' ? 'verify' as any : type as any, 'review', t);
        alert.setModel({
            isOpen: true,
            variant: type === 'delete' ? 'destructive' : 'default',
            title,
            desc,
            pending: activePending || deletePending || approvedPending,
            handleConfirm: handler,
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <ShowHeader
                variant="plain"
                title={t('dashboard.review')}
                actions={
                    <>
                        {!review.is_approved && (
                            <Button
                                onClick={() => handleAction('is_approved')}
                                className="gap-2 bg-success hover:bg-success/90 text-white"
                                disabled={approvedPending}
                            >
                                <CheckCircle className="h-4 w-4" /> {t('actions.verify')}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => handleAction('active')}
                            className={cn("gap-2", review.is_active ? "text-destructive border-destructive/20 hover:bg-destructive/5" : "text-success border-success/20 hover:bg-success/5")}
                            disabled={activePending}
                        >
                            {review.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            {review.is_active ? t('actions.deactivate') : t('actions.activate')}
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleAction('delete')}
                            disabled={deletePending}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                }
            />

            <div className="grid gap-6 md:grid-cols-3">
                {/* Review Content & Details */}
                <Card className="md:col-span-2 shadow-sm border-muted/60 overflow-hidden pt-0">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('dashboard.recentReviews')}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant={review.is_approved ? "default" : "secondary"} className="gap-1.5 px-3">
                                    {review.is_approved ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                    {review.is_approved ? t('status.approved') : t('status.pending')}
                                </Badge>
                                <Badge variant={review.is_active ? "outline" : "destructive"} className="px-3">
                                    {review.is_active ? t('status.active') : t('status.inactive')}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-6 w-6",
                                            i < review.rating ? "fill-warning text-warning" : "text-muted border-muted"
                                        )}
                                    />
                                ))}
                                <span className="ml-2 text-lg font-bold">{review.rating}/5</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                                <Calendar className="h-4 w-4" />
                                {review.created_at}
                            </div>
                        </div>

                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><MessageSquare className="h-12 w-12" /></div>
                            <p className="text-lg leading-relaxed text-foreground italic">"{review.comment}"</p>
                        </div>

                        {review.images && review.images.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Eye className="h-4 w-4" /> {t('Form.labels.images')}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {review.images.map((img) => (
                                        <a
                                            key={img.id}
                                            href={img.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group relative aspect-square rounded-xl overflow-hidden border border-muted-foreground/10 hover:border-primary/50 transition-all shadow-sm"
                                        >
                                            <img
                                                src={img.url}
                                                alt="Review"
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ExternalLink className="text-white h-6 w-6" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <EntityLinkCard
                        title={t('common.user')}
                        titleIcon={<User className="h-4 w-4" />}
                        to="/users/show/$id"
                        params={{ id: String(review.user.id) }}
                        image={review.user.image?.url}
                        name={review.user.full_name}
                        fallbackText={review.user.full_name?.substring(0, 2).toUpperCase()}
                        subtitle={review.user.email}
                        variant="avatar"
                    />

                    <EntityLinkCard
                        title={t('common.product')}
                        titleIcon={<Package className="h-4 w-4" />}
                        to="/products/show/$id"
                        params={{ id: String(review.product.id) }}
                        image={review.product.image?.url}
                        name={review.product.name}
                        variant="image"
                        badge={<Badge variant="secondary" className="font-bold"># {review.product.id}</Badge>}
                    />
                </div>
            </div>
        </div>
    );
}
