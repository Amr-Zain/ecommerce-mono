import { Module } from '@nestjs/common';
import { ClientAttributesController } from './client-attributes.controller';
import { ClientAttributesService } from './client-attributes.service';
import { AttributesModule as CoreAttributesModule } from '@/core/attributes/attributes.module';

@Module({
  imports: [CoreAttributesModule],
  controllers: [ClientAttributesController],
  providers: [ClientAttributesService],
})
export class ClientAttributesModule {}
