import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IReviewsRepository, REVIEWS_REPOSITORY } from '@/common/interfaces';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto, ReviewQueryDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ClientReviewsService {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviewsRepository: IReviewsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByProduct(productId: bigint, query: ReviewQueryDto, _langId: string = 'en') {
    return this.reviewsRepository.findActiveVerifiedByProductPaginated(
      productId,
      Number(query.page) || 1,
      Number(query.limit) || 10,
    );
  }

  async findMine(userId: bigint, productId: bigint) {
    const [review, canReview] = await Promise.all([
      this.reviewsRepository.findUserReview(userId, productId),
      this.hasDeliveredPurchase(userId, productId),
    ]);
    return {
      review,
      canReview: canReview && !review,
      reason: review ? 'already_reviewed' : canReview ? null : 'delivered_purchase_required',
    };
  }

  async create(userId: bigint, dto: CreateReviewDto) {
    if (!(await this.hasDeliveredPurchase(userId, BigInt(dto.productId)))) {
      throw new BadRequestException('A delivered purchase is required to review this product');
    }
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

  private async hasDeliveredPurchase(userId: bigint, productId: bigint) {
    const item = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        isActive: true,
        order: { userId, isActive: true, status: 'delivered' },
      },
      select: { id: true },
    });
    return Boolean(item);
  }
}
