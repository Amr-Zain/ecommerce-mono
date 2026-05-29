import { Module } from '@nestjs/common';
import { ClientSlidersController } from './client-sliders.controller';
import { ClientSlidersService } from './client-sliders.service';
import { SlidersModule as CoreSlidersModule } from '@/core/sliders/sliders.module';

@Module({
  imports: [CoreSlidersModule],
  controllers: [ClientSlidersController],
  providers: [ClientSlidersService],
})
export class ClientSlidersModule {}