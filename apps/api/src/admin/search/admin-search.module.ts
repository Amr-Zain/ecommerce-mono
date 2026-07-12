import { Module } from '@nestjs/common';
import { SearchModule } from '@/search/search.module';
import { SearchStatusController } from '@/search/search-status.controller';

@Module({
  imports: [SearchModule],
  controllers: [SearchStatusController],
})
export class AdminSearchModule {}
