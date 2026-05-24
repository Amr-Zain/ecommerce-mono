import { Module } from '@nestjs/common';
import { MediaModule } from '@/media/media.module';
import { REVIEWS_REPOSITORY } from '@/common/interfaces';
import { ReviewsRepository } from './reviews.repository';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: REVIEWS_REPOSITORY,
      useClass: ReviewsRepository,
    },
  ],
  exports: [REVIEWS_REPOSITORY],
})
export class ReviewsModule {}
