import { Module } from '@nestjs/common';
import { COLLECTIONS_REPOSITORY } from '@/common/interfaces';
import { CollectionsRepository } from './collections.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: COLLECTIONS_REPOSITORY,
      useClass: CollectionsRepository,
    },
  ],
  exports: [COLLECTIONS_REPOSITORY],
})
export class CollectionsModule {}
