import { Module } from '@nestjs/common';
import { StaticPageService } from './static-pages.service';
import { StaticPagesController } from './static-pages.controller';
import { StaticPagesModule as CoreStaticPagesModule } from '@/core/static-pages/static-pages.module';

@Module({
  imports: [CoreStaticPagesModule],
  controllers: [StaticPagesController],
  providers: [StaticPageService],
  exports: [StaticPageService],
})
export class StaticPagesModule {}
