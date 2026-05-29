import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IReviewsRepository, REVIEWS_REPOSITORY } from '@/common/interfaces';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviewsRepository: IReviewsRepository,
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
    return this.reviewsRepository.updateAdminReview(id, data);
  }

  async remove(id: bigint) {
    return this.reviewsRepository.deleteById(id);
  }
}
