import { BadRequestException } from '@nestjs/common';
import { ClientReviewsService } from './client-reviews.service';

describe('ClientReviewsService', () => {
  const createService = (hasPurchase: boolean) => {
    const reviewsRepository = {
      findUserReview: jest.fn().mockResolvedValue(null),
      hasVerifiedDeliveredPurchase: jest.fn().mockResolvedValue(hasPurchase),
      createForUser: jest.fn().mockResolvedValue({ id: 99n, productId: 10n }),
    };
    const publicCacheInvalidation = { publish: jest.fn() };
    const loyaltyService = { awardReview: jest.fn().mockResolvedValue(undefined) };

    const service = new ClientReviewsService(
      reviewsRepository as never,
      publicCacheInvalidation as never,
      loyaltyService as never,
    );

    return { service, reviewsRepository, publicCacheInvalidation, loyaltyService };
  };

  it('blocks review creation when the user has no verified delivered purchase', async () => {
    const { service, reviewsRepository } = createService(false);

    await expect(service.create(7n, { productId: 10, rating: 5 })).rejects.toBeInstanceOf(BadRequestException);
    expect(reviewsRepository.createForUser).not.toHaveBeenCalled();
  });

  it('allows review creation after a verified delivered purchase', async () => {
    const { service, reviewsRepository } = createService(true);

    await service.create(7n, { productId: 10, rating: 5 });

    expect(reviewsRepository.hasVerifiedDeliveredPurchase).toHaveBeenCalledWith(7n, 10n);
    expect(reviewsRepository.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7n, productId: 10n, rating: 5 }),
    );
  });
});
