import { Module } from '@nestjs/common';
import { ClientCollectionsController } from './client-collections.controller';
import { ClientCollectionsService } from './client-collections.service';
import { CollectionsModule as CoreCollectionsModule } from '@/core/collections/collections.module';

@Module({
  imports: [CoreCollectionsModule],
  controllers: [ClientCollectionsController],
  providers: [ClientCollectionsService],
})
export class ClientCollectionsModule {}
