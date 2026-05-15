import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { SlidersRepository } from './sliders.repository';

@Module({
  controllers: [SlidersController],
  providers: [SlidersService, SlidersRepository],
  exports: [SlidersService, SlidersRepository],
})
export class SlidersModule {}
