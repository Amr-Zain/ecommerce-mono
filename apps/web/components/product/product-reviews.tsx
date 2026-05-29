"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import { Button } from "@ecommerce/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ecommerce/ui/components/dialog"
import { Input } from "@ecommerce/ui/components/input"
import { Label } from "@ecommerce/ui/components/label"
import { Textarea } from "@ecommerce/ui/components/textarea"
import { cn } from "@/lib/utils"

export function Stars({ rating = 5, maxStars = 5 }: { rating?: number; maxStars?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, index) => {
        const fillPercent = Math.max(0, Math.min(100, (rating - index) * 100))
        return (
          <div key={index} className="relative size-4">
            {/* Background unfilled star */}
            <HugeiconsIcon
              icon={StarIcon}
              strokeWidth={2}
              className="absolute inset-0 size-4 text-muted-foreground/30"
            />
            {/* Foreground filled star */}
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden text-primary"
                style={{ width: `${fillPercent}%` }}
              >
                <div className="size-4">
                  <HugeiconsIcon
                    icon={StarIcon}
                    strokeWidth={2}
                    className="size-4 fill-current [&_path]:fill-current"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InteractiveStarRating({
  rating,
  onChange,
}: {
  rating: number
  onChange: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)

  return (
    <div className="flex items-center gap-1.5 py-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        const active = starValue <= (hoverRating ?? rating)
        return (
          <button
            key={index}
            type="button"
            className="text-muted-foreground/30 transition-transform hover:scale-110 focus:outline-none"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(null)}
          >
            <HugeiconsIcon
              icon={StarIcon}
              strokeWidth={2}
              className={cn(
                "size-7 transition-colors",
                active && "text-primary fill-current [&_path]:fill-current"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function Reviews({
  initialReviews = [],
}: {
  initialReviews?: Array<{ name: string; date: string; rating: number; copy: string }>
}) {
  const [reviewsList, setReviewsList] = React.useState(initialReviews)
  const [isWriteOpen, setIsWriteOpen] = React.useState(false)
  const [isViewAllOpen, setIsViewAllOpen] = React.useState(false)

  const [name, setName] = React.useState("")
  const [rating, setRating] = React.useState(5)
  const [copy, setCopy] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !copy.trim()) return
    const newReview = {
      name,
      rating,
      copy,
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" }),
    }
    setReviewsList((prev) => [newReview, ...prev])
    setName("")
    setRating(5)
    setCopy("")
    setIsWriteOpen(false)
  }

  const averageRating = React.useMemo(() => {
    if (reviewsList.length === 0) return 0
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / reviewsList.length) * 10) / 10
  }, [reviewsList])

  const ratingDistribution = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0] // 5, 4, 3, 2, 1 stars
    reviewsList.forEach((r) => {
      const index = 5 - Math.round(r.rating)
      if (index >= 0 && index < 5) {
        counts[index]++
      }
    })
    return counts.map((count) =>
      reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0
    )
  }, [reviewsList])

  return (
    <section className="grid gap-8 py-10 lg:grid-cols-[0.75fr_1.5fr]">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
        <div className="rounded-lg bg-muted p-6 text-center">
          <div className="text-4xl font-semibold">{averageRating}/5</div>
          <div className="mt-2 flex justify-center">
            <Stars rating={averageRating} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on {reviewsList.length} verified {reviewsList.length === 1 ? "review" : "reviews"}
          </p>
          <div className="mt-5 space-y-2">
            {ratingDistribution.map((value, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right">{5 - index}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {Math.round(value)}%
                </span>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setIsWriteOpen(true)}
            className="mt-5 h-9 px-6 rounded-full text-xs font-semibold"
          >
            Write Review
          </Button>
        </div>
      </div>
      <div className="space-y-5 flex flex-col justify-between">
        <div className="space-y-5">
          {reviewsList.slice(0, 3).map((review, i) => (
            <article key={i} className="border-b pb-5 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Stars rating={review.rating} />
                  <h3 className="mt-2 text-sm font-semibold">{review.name}</h3>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {review.copy}
              </p>
            </article>
          ))}
        </div>
        {reviewsList.length > 3 && (
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewAllOpen(true)}
              className="h-9 px-6 rounded-full text-sm font-semibold"
            >
              View All Reviews
            </Button>
          </div>
        )}
      </div>

      {/* Write Review Dialog */}
      <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="review-name">Your Name</Label>
              <Input
                id="review-name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <InteractiveStarRating rating={rating} onChange={setRating} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="review-copy">Review Content</Label>
              <Textarea
                id="review-copy"
                placeholder="What did you like or dislike about this product?"
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                required
                rows={4}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWriteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View All Reviews Dialog */}
      <Dialog open={isViewAllOpen} onOpenChange={setIsViewAllOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>All Reviews ({reviewsList.length})</DialogTitle>
            <DialogDescription>
              See what others are saying about this product.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {reviewsList.map((review, i) => (
              <article key={i} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Stars rating={review.rating} />
                    <h3 className="mt-2 text-sm font-semibold">{review.name}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {review.copy}
                </p>
              </article>
            ))}
          </div>
          <DialogFooter className="p-6 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewAllOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
