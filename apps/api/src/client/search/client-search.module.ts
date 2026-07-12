import { Module } from '@nestjs/common';
import { SearchModule } from '@/search/search.module';
import { SearchController } from '@/search/search.controller';

@Module({
  imports: [SearchModule],
  controllers: [SearchController],
})
export class ClientSearchModule {}
