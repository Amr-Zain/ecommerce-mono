import { Module } from '@nestjs/common';
import { ClientReviewsController } from './client-reviews.controller';
import { ClientReviewsService } from './client-reviews.service';
import { ReviewsModule } from '@/core/reviews/reviews.module';

@Module({
  imports: [ReviewsModule],
  controllers: [ClientReviewsController],
  providers: [ClientReviewsService],
})
export class ClientReviewsModule {}
