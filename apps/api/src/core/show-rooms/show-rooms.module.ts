import { Module } from '@nestjs/common';
import { SHOW_ROOMS_REPOSITORY } from '@/common/interfaces';
import { ShowRoomsRepository } from './show-rooms.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: SHOW_ROOMS_REPOSITORY,
      useClass: ShowRoomsRepository,
    },
  ],
  exports: [SHOW_ROOMS_REPOSITORY],
})
export class ShowRoomsModule {}
