import { Global, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { LocalStorageService } from './storage/local-storage.service';

@Global()
@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: 'StorageInterface',
      useClass: LocalStorageService,
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
