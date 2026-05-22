import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { CollectionsModule as CoreCollectionsModule } from '@/core/collections/collections.module';

@Module({
  imports: [CoreCollectionsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
