import { Module } from '@nestjs/common';
import { ClientStaticPagesController } from './client-static-pages.controller';
import { ClientStaticPagesService } from './client-static-pages.service';
import { StaticPagesModule as CoreStaticPagesModule } from '@/core/static-pages/static-pages.module';

@Module({
  imports: [CoreStaticPagesModule],
  controllers: [ClientStaticPagesController],
  providers: [ClientStaticPagesService],
})
export class ClientStaticPagesModule {}
