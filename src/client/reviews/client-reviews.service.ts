import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ClientReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: bigint) {
    return this.prisma.review.findMany({
      where: { productId, isActive: true },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: bigint, dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        userId,
        productId: BigInt(dto.productId),
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async update(userId: bigint, id: bigint, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }
    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async remove(userId: bigint, id: bigint) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    return this.prisma.review.delete({ where: { id } });
  }
}