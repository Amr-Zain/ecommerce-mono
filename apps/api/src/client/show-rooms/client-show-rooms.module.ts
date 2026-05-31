import { Module } from '@nestjs/common';
import { ClientShowRoomsController } from './client-show-rooms.controller';
import { ClientShowRoomsService } from './client-show-rooms.service';
import { ShowRoomsModule as CoreShowRoomsModule } from '@/core/show-rooms/show-rooms.module';

@Module({
  imports: [CoreShowRoomsModule],
  controllers: [ClientShowRoomsController],
  providers: [ClientShowRoomsService],
})
export class ClientShowRoomsModule {}
