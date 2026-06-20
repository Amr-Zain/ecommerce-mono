import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IReviewsRepository, REVIEWS_REPOSITORY } from '@/common/interfaces';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  PUBLIC_CACHE_EVENTS,
  PublicCacheInvalidationPublisher,
} from '@/shared/cache/public-cache-invalidation.service';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviewsRepository: IReviewsRepository,
    private readonly publicCacheInvalidation: PublicCacheInvalidationPublisher,
  ) {}

  async findAll(query: ReviewQueryDto) {
    return this.reviewsRepository.findAllAdmin(query);
  }

  async findOne(id: bigint) {
    const review = await this.reviewsRepository.findAdminById(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: bigint, data: { isActive?: boolean; isApproved?: boolean; isVerified?: boolean }) {
    const review = await this.reviewsRepository.updateAdminReview(id, data);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.reviewsChanged, { productId: review.productId });
    return review;
  }

  async remove(id: bigint) {
    const review = await this.reviewsRepository.findOwnerById(id);
    const deleted = await this.reviewsRepository.deleteById(id);
    this.publicCacheInvalidation.publish(PUBLIC_CACHE_EVENTS.reviewsChanged, { productId: review?.productId });
    return deleted;
  }
}
