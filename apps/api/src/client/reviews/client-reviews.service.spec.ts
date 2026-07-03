import { BadRequestException } from '@nestjs/common';
import { ClientReviewsService } from './client-reviews.service';

describe('ClientReviewsService', () => {
  const createService = (hasPurchase: boolean) => {
    const reviewsRepository = {
      findUserReview: jest.fn().mockResolvedValue(null),
      createForUser: jest.fn().mockResolvedValue({ id: 99n, productId: 10n }),
    };
    const prisma = {
      orderItem: {
        findFirst: jest.fn().mockResolvedValue(hasPurchase ? { id: 1n } : null),
      },
    };
    const publicCacheInvalidation = { publish: jest.fn() };
    const loyaltyService = { awardReview: jest.fn().mockResolvedValue(undefined) };

    const service = new ClientReviewsService(
      reviewsRepository as never,
      prisma as never,
      publicCacheInvalidation as never,
      loyaltyService as never,
    );

    return { service, reviewsRepository, prisma, publicCacheInvalidation, loyaltyService };
  };

  it('blocks review creation when the user has no verified delivered purchase', async () => {
    const { service, reviewsRepository } = createService(false);

    await expect(service.create(7n, { productId: 10, rating: 5 })).rejects.toBeInstanceOf(BadRequestException);
    expect(reviewsRepository.createForUser).not.toHaveBeenCalled();
  });

  it('allows review creation after a verified delivered purchase', async () => {
    const { service, reviewsRepository, prisma } = createService(true);

    await service.create(7n, { productId: 10, rating: 5 });

    expect(prisma.orderItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ productId: 10n }, { variant: { productId: 10n } }],
          order: expect.objectContaining({
            userId: 7n,
            status: 'delivered',
            paymentStatus: 'completed',
            deliveredAt: { not: null },
          }),
        }),
      }),
    );
    expect(reviewsRepository.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7n, productId: 10n, rating: 5 }),
    );
  });
});
