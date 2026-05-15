import { PartialType } from '@nestjs/mapped-types';
import { createCityDto } from './create-city.dto';

export class UpdateCityDto extends PartialType(createCityDto) {}
