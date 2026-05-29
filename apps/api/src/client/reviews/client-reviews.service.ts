import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IReviewsRepository, REVIEWS_REPOSITORY } from '@/common/interfaces';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ClientReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviewsRepository: IReviewsRepository,
  ) {}

  async findByProduct(productId: bigint, langId: string = 'en') {
    return this.reviewsRepository.findActiveVerifiedByProduct(productId);
  }

  async create(userId: bigint, dto: CreateReviewDto) {
    return this.reviewsRepository.createForUser({
      userId,
      productId: BigInt(dto.productId),
      rating: dto.rating,
      comment: dto.comment,
      images: dto.images,
    });
  }

  async update(userId: bigint, id: bigint, dto: UpdateReviewDto) {
    const review = await this.reviewsRepository.findOwnerById(id);
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.reviewsRepository.updateClientReview(id, {
      rating: dto.rating,
      comment: dto.comment,
      images: dto.images,
    });
  }

  async remove(userId: bigint, id: bigint) {
    const review = await this.reviewsRepository.findOwnerById(id);
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    return this.reviewsRepository.deleteById(id);
  }
}
