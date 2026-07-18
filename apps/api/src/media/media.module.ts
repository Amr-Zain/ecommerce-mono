import { Global, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { LocalStorageService } from './storage/local-storage.service';
import { MediaCleanupTask } from './media-cleanup.task';
import { MediaRepository } from './media.repository';
import { MEDIA_REPOSITORY } from './media.repository.port';

@Global()
@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaCleanupTask,
    { provide: MEDIA_REPOSITORY, useClass: MediaRepository },
    {
      provide: 'StorageInterface',
      useClass: LocalStorageService,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
