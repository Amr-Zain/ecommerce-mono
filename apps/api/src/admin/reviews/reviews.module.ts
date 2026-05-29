import { Module } from '@nestjs/common';
import { ReviewsModule as CoreReviewsModule } from '@/core/reviews/reviews.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [CoreReviewsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
