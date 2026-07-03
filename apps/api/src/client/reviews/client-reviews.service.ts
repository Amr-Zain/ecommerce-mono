import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IReviewsRepository, REVIEWS_REPOSITORY } from '@/common/interfaces';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from './dto/review.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';
import { ORDER_STATUSES } from '@/client/orders/order.constants';
import { PAYMENT_STATUSES } from '@/shared/payment/payment.constants';

@Injectable()
export class ClientReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviewsRepository: IReviewsRepository,
    private readonly prisma: PrismaService,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async findByProduct(productId: bigint, query: ReviewQueryDto, _langId: string = 'en') {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    return this.reviewsRepository.findActiveVerifiedByProductPaginated(productId, page, limit);
  }

  async findMine(userId: bigint, productId: bigint) {
    const normalizedUserId = BigInt(userId);
    const normalizedProductId = BigInt(productId);
    const [review, canReview] = await Promise.all([
      this.reviewsRepository.findUserReview(normalizedUserId, normalizedProductId),
      this.hasVerifiedDeliveredPurchase(normalizedUserId, normalizedProductId),
    ]);
    return {
      review,
      canReview: canReview && !review,
      reason: review ? 'already_reviewed' : canReview ? null : 'delivered_purchase_required',
    };
  }

  async create(userId: bigint, dto: CreateReviewDto) {
    const normalizedUserId = BigInt(userId);
    const normalizedProductId = BigInt(dto.productId);
    const [existingReview, hasDeliveredPurchase] = await Promise.all([
      this.reviewsRepository.findUserReview(normalizedUserId, normalizedProductId),
      this.hasVerifiedDeliveredPurchase(normalizedUserId, normalizedProductId),
    ]);
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }
    if (!hasDeliveredPurchase) {
      throw new BadRequestException('A delivered purchase is required to review this product');
    }
    const review = await this.reviewsRepository.createForUser({
      userId: normalizedUserId,
      productId: normalizedProductId,
      rating: dto.rating,
      comment: dto.comment,
      images: dto.images,
    });
    await this.loyaltyService.awardReview(normalizedUserId, review.id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.reviewsChanged, { productId: normalizedProductId });
    return review;
  }

  async update(userId: bigint, id: bigint, dto: UpdateReviewDto) {
    const review = await this.reviewsRepository.findOwnerById(id);
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updated = await this.reviewsRepository.updateClientReview(id, {
      rating: dto.rating,
      comment: dto.comment,
      images: dto.images,
    });
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.reviewsChanged, { productId: review.productId });
    return updated;
  }

  async remove(userId: bigint, id: bigint) {
    const review = await this.reviewsRepository.findOwnerById(id);
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    const deleted = await this.reviewsRepository.deleteById(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.reviewsChanged, { productId: review.productId });
    return deleted;
  }

  private async hasVerifiedDeliveredPurchase(userId: bigint, productId: bigint) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        isActive: true,
        OR: [{ productId }, { variant: { productId } }],
        order: {
          userId,
          isActive: true,
          status: ORDER_STATUSES.delivered,
          paymentStatus: PAYMENT_STATUSES.completed,
          deliveredAt: { not: null },
        },
      },
      select: { id: true },
    });
    return Boolean(item);
  }
}
