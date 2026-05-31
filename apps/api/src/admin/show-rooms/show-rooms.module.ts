import { Module } from '@nestjs/common';
import { ShowRoomsService } from './show-rooms.service';
import { ShowRoomsController } from './show-rooms.controller';
import { ShowRoomsModule as CoreShowRoomsModule } from '@/core/show-rooms/show-rooms.module';

@Module({
  imports: [CoreShowRoomsModule],
  controllers: [ShowRoomsController],
  providers: [ShowRoomsService],
  exports: [ShowRoomsService],
})
export class ShowRoomsModule {}
