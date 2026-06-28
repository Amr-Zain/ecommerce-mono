"use client"

import { useTranslations } from "next-intl"

import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { useSession } from "next-auth/react"
import * as React from "react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@ecommerce/ui/components/alert-dialog"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@ecommerce/ui/components/dialog"
import { Label } from "@ecommerce/ui/components/label"
import { Skeleton } from "@ecommerce/ui/components/skeleton"
import { Textarea } from "@ecommerce/ui/components/textarea"
import {
  useCreateReview, useDeleteReview, useProductReviewEligibility,
  useProductReviews, useUpdateReview,
} from "@/hooks/api/use-product-reviews"
import type { ProductDetail, ProductReview } from "@/hooks/api/use-products"
import { cn } from "@/lib/utils"

function Stars({ rating = 0 }: { rating?: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, index) => (
    <HugeiconsIcon key={index} icon={StarIcon} className={cn("size-4 text-muted-foreground/30", index < Math.round(rating) && "fill-current text-primary [&_path]:fill-current")} />
  ))}</div>
}

function ReviewCard({ review }: { review: ProductReview }) {
  return <article className="border-b pb-5 last:border-0">
    <div className="flex justify-between gap-4"><div><Stars rating={review.rating} /><h3 className="mt-2 text-sm font-semibold">{review.user.name ?? "Customer"}</h3></div><span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span></div>
    {review.comment ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p> : null}
  </article>
}

function ProductReviews({ product }: { product: ProductDetail }) {
  const t = useTranslations("Product")
  const { status } = useSession()
  const loggedIn = status === "authenticated"
  const eligibility = useProductReviewEligibility(product.id, loggedIn)
  const mine = eligibility.data?.data.review
  const [formOpen, setFormOpen] = React.useState(false)
  const [allOpen, setAllOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState("")
  const reviews = useProductReviews(product.id, page, allOpen)
  const createReview = useCreateReview(product.id)
  const updateReview = useUpdateReview(product.id, mine?.id)
  const deleteReview = useDeleteReview(product.id, mine?.id)

  const openForm = () => {
    setRating(mine?.rating ?? 5)
    setComment(mine?.comment ?? "")
    setFormOpen(true)
  }
  const submit = () => {
    const mutation = mine ? updateReview : createReview
    mutation.mutate(
      mine ? { rating, comment } : { productId: Number(product.id), rating, comment },
      { onSuccess: () => setFormOpen(false) }
    )
  }

  return (
    <section className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.5fr]">
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t("reviews")}</h2>
        <div className="rounded-xl bg-muted p-6 text-center">
          <div className="text-4xl font-semibold">{product.reviews.average}/5</div>
          <div className="mt-2 flex justify-center"><Stars rating={product.reviews.average} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{t("basedOnVerified", { count: product.reviews.total })}</p>
          <div className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = product.reviews.distribution[star - 1] ?? 0
              const width = product.reviews.total ? count / product.reviews.total * 100 : 0
              return <div key={star} className="flex items-center gap-2 text-xs"><span>{star}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-background"><div className="h-full bg-primary" style={{ width: `${width}%` }} /></div><span>{count}</span></div>
            })}
          </div>
          <div className="mt-5 space-y-2">
            {!loggedIn ? <Button render={<Link href={ROUTES.auth.login} />} className="rounded-full">{t("loginToReview")}</Button> :
              eligibility.isLoading ? <Skeleton className="mx-auto h-8 w-32" /> :
              mine ? <><Badge variant={mine.is_verified ? "default" : "secondary"}>{mine.is_verified ? t("approved") : t("pendingApproval")}</Badge><div className="flex justify-center gap-2"><Button variant="outline" onClick={openForm}>{t("editReview")}</Button><Button variant="destructive" onClick={() => setDeleteOpen(true)}>{t("delete")}</Button></div></> :
              eligibility.data?.data.can_review ? <Button onClick={openForm} className="rounded-full">{t("writeReview")}</Button> :
              <Button disabled variant="outline">{t("deliveredPurchaseRequired")}</Button>}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-5">
        <div className="space-y-5">{product.reviews.items.length ? product.reviews.items.map((review) => <ReviewCard key={review.id} review={review} />) : <p className="text-sm text-muted-foreground">{t("noVerifiedReviews")}</p>}</div>
        {product.reviews.total > 3 ? <Button variant="outline" onClick={() => setAllOpen(true)} className="self-start">{t("viewAllReviews")}</Button> : null}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><DialogHeader><DialogTitle>{mine ? t("editReview") : t("writeReview")}</DialogTitle><DialogDescription>Your review will be visible after admin approval.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>{t("rating")}</Label><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <Button key={value} size="icon-sm" variant="ghost" onClick={() => setRating(value)}><HugeiconsIcon icon={StarIcon} className={cn(value <= rating && "fill-current text-primary [&_path]:fill-current")} /></Button>)}</div></div><div><Label htmlFor="review-comment">{t("reviewLabel")}</Label><Textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} /></div></div><DialogFooter><Button onClick={submit} disabled={createReview.isPending || updateReview.isPending}>{t("submitReview")}</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={allOpen} onOpenChange={setAllOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{t("allReviews")}</DialogTitle><DialogDescription>{product.reviews.total} verified reviews</DialogDescription></DialogHeader><div className="space-y-5">{reviews.isLoading ? Array.from({length:3},(_,i)=><Skeleton key={i} className="h-24 w-full" />) : reviews.data?.data.items.map((review)=><ReviewCard key={review.id} review={review} />)}</div><DialogFooter><Button variant="outline" disabled={!reviews.data?.data.meta.has_previous_page} onClick={()=>setPage((value)=>value-1)}>{t("previous")}</Button><span className="self-center text-sm">{t("page", { number: page })}</span><Button variant="outline" disabled={!reviews.data?.data.meta.has_next_page} onClick={()=>setPage((value)=>value+1)}>{t("next")}</Button></DialogFooter></DialogContent></Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("deleteReviewConfirm")}</AlertDialogTitle><AlertDialogDescription>{t("deleteReviewDescription")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => deleteReview.mutate({}, { onSuccess: () => setDeleteOpen(false) })}>{t("delete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </section>
  )
}

export { ProductReviews, Stars }
