import { Global, Module } from '@nestjs/common';
import { QueryBuilderService } from './services/query-builder.service';

@Global()
@Module({
  providers: [QueryBuilderService],
  exports: [QueryBuilderService],
})
export class CommonModule {}
