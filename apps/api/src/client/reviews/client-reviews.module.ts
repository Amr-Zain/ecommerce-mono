import { Module } from '@nestjs/common';
import { ClientReviewsController } from './client-reviews.controller';
import { ClientReviewsService } from './client-reviews.service';
import { ReviewsModule } from '@/core/reviews/reviews.module';
import { LoyaltyModule } from '@/shared/loyalty/loyalty.module';

@Module({
  imports: [ReviewsModule, LoyaltyModule],
  controllers: [ClientReviewsController],
  providers: [ClientReviewsService],
})
export class ClientReviewsModule {}
