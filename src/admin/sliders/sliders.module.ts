import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { SlidersModule as CoreSlidersModule } from '@/core/sliders/sliders.module';

@Module({
  imports: [CoreSlidersModule],
  controllers: [SlidersController],
  providers: [SlidersService],
  exports: [SlidersService],
})
export class SlidersModule {}
