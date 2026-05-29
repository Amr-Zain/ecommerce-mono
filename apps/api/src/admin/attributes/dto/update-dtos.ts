import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeDto } from './attribute.dto';
import { CreateAttributeValueDto } from './attribute-value.dto';

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}
export class UpdateAttributeValueDto extends PartialType(CreateAttributeValueDto) {}
