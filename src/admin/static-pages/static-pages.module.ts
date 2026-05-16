import { Module } from '@nestjs/common';
import { StaticPageService } from './static-pages.service';
import { StaticPagesController } from './static-pages.controller';
import { StaticPagesRepository } from './static-pages.repository';

@Module({
  controllers: [StaticPagesController],
  providers: [StaticPageService, StaticPagesRepository],
  exports: [StaticPageService, StaticPagesRepository],
})
export class StaticPagesModule {}
