import { Module } from '@nestjs/common';
import { ClientReviewsController } from './client-reviews.controller';
import { ClientReviewsService } from './client-reviews.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientReviewsController],
  providers: [ClientReviewsService],
})
export class ClientReviewsModule {}