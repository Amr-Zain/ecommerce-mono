import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { AttributesRepository } from './attributes.repository';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValuesController } from './attribute-values.controller';
import { AttributeValuesRepository } from './attribute-values.repository';

@Module({
  controllers: [AttributesController, AttributeValuesController],
  providers: [AttributesService, AttributesRepository, AttributeValuesService, AttributeValuesRepository],
  exports: [AttributesService, AttributesRepository, AttributeValuesService, AttributeValuesRepository],
})
export class AttributesModule {}
