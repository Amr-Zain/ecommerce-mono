import { Module } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, ATTRIBUTE_VALUES_REPOSITORY } from '@/common/interfaces';
import { AttributesRepository } from './attributes.repository';
import { AttributeValuesRepository } from './attribute-values.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: ATTRIBUTES_REPOSITORY,
      useClass: AttributesRepository,
    },
    {
      provide: ATTRIBUTE_VALUES_REPOSITORY,
      useClass: AttributeValuesRepository,
    },
  ],
  exports: [ATTRIBUTES_REPOSITORY, ATTRIBUTE_VALUES_REPOSITORY],
})
export class AttributesModule {}