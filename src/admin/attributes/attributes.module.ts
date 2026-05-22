import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValuesController } from './attribute-values.controller';
import { AttributesModule as CoreAttributesModule } from '@/core/attributes/attributes.module';

@Module({
  imports: [CoreAttributesModule],
  controllers: [AttributesController, AttributeValuesController],
  providers: [AttributesService, AttributeValuesService],
  exports: [AttributesService, AttributeValuesService],
})
export class AttributesModule {}
